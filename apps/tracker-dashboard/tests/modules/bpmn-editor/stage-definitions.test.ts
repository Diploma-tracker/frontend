import {
  isStageElement,
  isSubProcessType,
  orderStages,
  parseStageAttributes,
  parseStageOrder,
  serializeStageAttributes,
  serializeStageOrder,
} from '@/modules/bpmn-editor';
import { describe, expect, it } from 'vitest';

describe('parseStageOrder', () => {
  it('parses a JSON array of ids', () => {
    expect(parseStageOrder('["a","b","c"]')).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty list for null or empty input', () => {
    expect(parseStageOrder(null)).toEqual([]);
    expect(parseStageOrder(undefined)).toEqual([]);
    expect(parseStageOrder('')).toEqual([]);
  });

  it('returns an empty list for invalid JSON', () => {
    expect(parseStageOrder('not json')).toEqual([]);
  });

  it('returns an empty list for a non-array payload', () => {
    expect(parseStageOrder('{"a":1}')).toEqual([]);
  });

  it('drops non-string entries', () => {
    expect(parseStageOrder('["a",1,"b",true]')).toEqual(['a', 'b']);
  });
});

describe('serializeStageOrder', () => {
  it('round-trips through parseStageOrder', () => {
    const ids = ['stage-1', 'stage-2'];

    expect(parseStageOrder(serializeStageOrder(ids))).toEqual(ids);
  });

  it('encodes an empty list', () => {
    expect(serializeStageOrder([])).toBe('[]');
  });
});

describe('orderStages', () => {
  it('orders present ids by the persisted order', () => {
    expect(orderStages(['b', 'a', 'c'], ['c', 'a'])).toEqual(['c', 'a', 'b']);
  });

  it('appends ids missing from the order at the end', () => {
    expect(orderStages(['a', 'b', 'c'], ['c'])).toEqual(['c', 'a', 'b']);
  });

  it('drops ids that are no longer present', () => {
    expect(orderStages(['a', 'c'], ['a', 'b', 'c'])).toEqual(['a', 'c']);
  });

  it('falls back to diagram order without a persisted order', () => {
    expect(orderStages(['a', 'b', 'c'], [])).toEqual(['a', 'b', 'c']);
  });

  it('preserves every present id exactly once', () => {
    const result = orderStages(['a', 'b', 'c'], ['b', 'b', 'a']);

    expect([...result].sort()).toEqual(['a', 'b', 'c']);
    expect(new Set(result).size).toBe(result.length);
  });
});

describe('isSubProcessType', () => {
  it('recognizes subprocesses only', () => {
    expect(isSubProcessType('bpmn:SubProcess')).toBe(true);
    expect(isSubProcessType('bpmn:UserTask')).toBe(false);
    expect(isSubProcessType('bpmn:Task')).toBe(false);
  });
});

describe('serializeStageOrder round trip', () => {
  it('keeps an order stable through encode and decode', () => {
    const ids = ['stage-1', 'stage-2', 'stage-3'];

    expect(parseStageOrder(serializeStageOrder(ids))).toEqual(ids);
  });
});

describe('parseStageAttributes', () => {
  it('parses a deadline from a JSON object', () => {
    expect(
      parseStageAttributes('{"deadline":"2026-06-01T12:00:00.000Z"}'),
    ).toEqual({ deadline: '2026-06-01T12:00:00.000Z' });
  });

  it('parses a relative deadline duration', () => {
    expect(parseStageAttributes('{"deadlineDuration":"P3M5D"}')).toEqual({
      deadlineDuration: 'P3M5D',
    });
    expect(parseStageAttributes('{"deadlineDuration":"P1Y2M3D"}')).toEqual({
      deadlineDuration: 'P1Y2M3D',
    });
  });

  it('keeps both deadline shapes when both are present', () => {
    expect(
      parseStageAttributes(
        '{"deadline":"2026-06-01T12:00:00.000Z","deadlineDuration":"P3M5D"}',
      ),
    ).toEqual({
      deadline: '2026-06-01T12:00:00.000Z',
      deadlineDuration: 'P3M5D',
    });
  });

  it('drops a deadline duration that is not an ISO 8601 duration', () => {
    expect(parseStageAttributes('{"deadlineDuration":"soon"}')).toEqual({});
    expect(parseStageAttributes('{"deadlineDuration":""}')).toEqual({});
  });

  it('returns empty attributes for a stage without extra data', () => {
    expect(parseStageAttributes('{}')).toEqual({});
  });

  it('returns null for an absent attribute', () => {
    expect(parseStageAttributes(null)).toEqual(null);
    expect(parseStageAttributes(undefined)).toEqual(null);
    expect(parseStageAttributes('')).toEqual(null);
  });

  it('degrades invalid JSON to empty attributes', () => {
    expect(parseStageAttributes('not json')).toEqual({});
  });

  it('drops a non-object payload', () => {
    expect(parseStageAttributes('["deadline"]')).toEqual({});
    expect(parseStageAttributes('null')).toEqual({});
    expect(parseStageAttributes('42')).toEqual({});
  });

  it('drops a non-string or empty deadline', () => {
    expect(parseStageAttributes('{"deadline":42}')).toEqual({});
    expect(parseStageAttributes('{"deadline":""}')).toEqual({});
  });
});

describe('serializeStageAttributes', () => {
  it('encodes a deadline', () => {
    expect(
      serializeStageAttributes({ deadline: '2026-06-01T12:00:00.000Z' }),
    ).toBe('{"deadline":"2026-06-01T12:00:00.000Z"}');
  });

  it('encodes a relative deadline duration', () => {
    expect(serializeStageAttributes({ deadlineDuration: 'P1Y2M3D' })).toBe(
      '{"deadlineDuration":"P1Y2M3D"}',
    );
  });

  it('encodes a stage without extra data', () => {
    expect(serializeStageAttributes({})).toBe('{}');
  });

  it('round-trips through parseStageAttributes', () => {
    const info = { deadline: '2026-06-01T12:00:00.000Z' };
    const relative = { deadlineDuration: 'P3M5D' };

    expect(parseStageAttributes(serializeStageAttributes(info))).toEqual(info);
    expect(parseStageAttributes(serializeStageAttributes(relative))).toEqual(
      relative,
    );
    expect(parseStageAttributes(serializeStageAttributes({}))).toEqual({});
  });
});

describe('isStageElement', () => {
  const subprocess = (stage: string | undefined) => ({
    type: 'bpmn:SubProcess',
    businessObject: {
      get: (name: string) => (name === 'stage' ? stage : null),
    },
  });

  it('recognises a subprocess carrying the stage attribute', () => {
    expect(isStageElement(subprocess('{}'))).toBe(true);
    expect(isStageElement(subprocess('{"deadline":"2026-06-01"}'))).toBe(true);
  });

  it('rejects a subprocess without the attribute', () => {
    expect(isStageElement(subprocess(undefined))).toBe(false);
    expect(isStageElement(subprocess(''))).toBe(false);
  });

  it('rejects non-subprocess elements and empty input', () => {
    expect(
      isStageElement({
        type: 'bpmn:UserTask',
        businessObject: { get: () => '{}' },
      }),
    ).toBe(false);
    expect(isStageElement(null)).toBe(false);
    expect(isStageElement(undefined)).toBe(false);
  });
});
