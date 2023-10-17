export const $page = async ({ db, currentPage = 1, pageSize = 20, query = {}, sort = { created_at: -1 } }) => {
  const list = await db
    .find(query)
    .sort(sort)
    .skip((+currentPage - 1) * +pageSize)
    .limit(+pageSize)
    .exec()
  const total = await db.count()
  return { list, pageInfo: { currentPage, pageSize, total } }
}
