const buildQuery = (searchTerms: string[], searchFields: string[]) => {
  const query: any = {};
  if (searchTerms && searchTerms.length > 0) {
    const searchConditions = searchTerms.map((term) => ({
      $or: searchFields.map((field) => ({
        [field]: { $regex: term, $options: "i" },
      })),
    }));
    query.$and = searchConditions;
  }
  return query;
};

export default buildQuery;
