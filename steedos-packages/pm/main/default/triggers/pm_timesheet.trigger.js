module.exports = {
  listenTo: 'pm_timesheet',

  beforeInsert: async function () {
    await validateHours(this);
  },

  beforeUpdate: async function () {
    await validateHours(this);
  }
};

async function validateHours(ctx) {
  const doc = ctx.doc;
  if (typeof doc.hours === 'number' && (doc.hours < 0 || doc.hours > 24)) {
    throw new Error('单条工时记录必须在 0 到 24 小时之间');
  }
  // 校验同一用户同一天总工时不超过 24
  if (doc.user && doc.work_date && typeof doc.hours === 'number') {
    const obj = ctx.getObject('pm_timesheet');
    const sameDay = await obj.find({
      filters: [
        ['user', '=', doc.user],
        ['work_date', '=', doc.work_date]
      ],
      fields: ['_id', 'hours']
    });
    let total = doc.hours;
    for (const t of sameDay) {
      if (ctx.id && t._id === ctx.id) continue; // 排除自身（更新时）
      total += t.hours || 0;
    }
    if (total > 24) {
      throw new Error(`当日工时总和不能超过 24 小时（当前：${total}）`);
    }
  }
}
