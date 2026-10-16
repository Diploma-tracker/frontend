import {
  isSubProcessType,
  orderStages,
  parseStageOrder,
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
