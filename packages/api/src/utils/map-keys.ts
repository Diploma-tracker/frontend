import _ from 'lodash';

export const mapKeys = (obj: any, map: (name: string) => string): any => {
  const mapNested = (name: string) => mapKeys(name, map);

  if (_.isArray(obj)) {
    return obj.map(mapNested);
  }

  if (_.isPlainObject(obj)) {
    return _.mapValues(
      _.mapKeys(obj, (_, key) => map(key)),
      (value) => mapNested(value),
    );
  }

  return obj;
};
