import { PaginationRespDto } from 'src/base/dto';

export const PaginationHandle = (
  query: object,
  page: number,
  pageSize: number,
) => {
  if (page && pageSize) {
    query['take'] = Number(pageSize);
    query['skip'] = Number((page - 1) * pageSize);
  }
  return query;
};

export const OrderByHandle = (query: object, orderBy: Array<object>) => {
  if (!query['orderBy']) query['orderBy'] = orderBy;
  else {
    if (query['orderBy'] instanceof Object) query['orderBy'] = query['orderBy'];
    orderBy.forEach((obj) => {
      query['orderBy'].push(obj);
    });
  }
  return query;
};

export const getPaginationInfo = (params: {
  count: number;
  pageSize: number;
  page: number;
}): PaginationRespDto => {
  const { count, pageSize, page } = params;
  console.log(params);
  const totalPage = Math.ceil(count / +pageSize);
  const nextPage = +page + 1 > totalPage ? null : +page + 1;

  return {
    total: count,
    totalPage,
    pageSize,
    page,
    nextPage,
  };
};
