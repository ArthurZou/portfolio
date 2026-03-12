export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const budget = body?.budget

  if (budget === undefined || budget === null || budget === '') {
    throw createError({ statusCode: 400, statusMessage: '请输入预算金额' })
  }

  const result = await run(budget)

  if (result.error) {
    throw createError({ statusCode: 400, statusMessage: result.error })
  }

  // Don't return candidates (too large)
  const { candidates: _, ...output } = result
  return output
})
