const { buildMongoQueryFromUrlQuery } = require('../apiUtils');

describe('buildMongoQueryFromUrlQuery', () => {
  test('parses pagination parameters correctly', async () => {
    const input = { page: "2", per: "10", foo: "bar" };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.pagination).toEqual({ page: 2, per: 10 });
    expect(result.query).toEqual({ foo: "bar" });
  });

  test('parses sort parameter correctly', async () => {
    const input = { sort: "name", foo: "bar" };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.sort).toBe("name");
    expect(result.query).toEqual({ foo: "bar" });
  });

  test('parses limit parameter correctly', async () => {
    const input = { limit: "5", foo: "bar" };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.limit).toBe(5);
    expect(result.query).toEqual({ foo: "bar" });
  });

  test('returns blank query if "all" key exists', async () => {
    const input = { all: "anything", foo: "bar" };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.query).toEqual({});
  });

  test('formats textSearch correctly and removes textSearch key', async () => {
    const input = { textSearch: "Joe Smith", foo: "bar" };
    const result = await buildMongoQueryFromUrlQuery(input);
    // Expected text search string: concatenation of \\"Joe" and \\"Smith"
    const expectedSearch = `\\"Joe"\\"Smith"`;
    expect(result.query.$text).toEqual({ $search: expectedSearch });
    expect(result.query.foo).toBe("bar");
    expect(result.query.textSearch).toBeUndefined();
  });

  test('converts "true", "false", and "null" string values to proper types', async () => {
    const input = { active: "true", deleted: "false", value: "null" };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.query.active).toBe(true);
    expect(result.query.deleted).toBe(false);
    expect(result.query.value).toBeNull();
  });

  test('converts an array value to {$in: array}', async () => {
    const input = { category: ["books", "electronics"] };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.query.category).toEqual({ $in: ["books", "electronics"] });
  });

  test('converts comma separated string to an array using $in', async () => {
    const input = { tags: "red,blue,green" };
    const result = await buildMongoQueryFromUrlQuery(input);
    expect(result.query.tags).toEqual({ $in: ["red", "blue", "green"] });
  });
});