module.exports = {
  listenTo: 'pm_project',

  beforeInsert: async function () {
    const doc = this.doc;
    if (doc.code) return;
    const year = new Date().getFullYear();
    const prefix = `PM-${year}-`;
    const obj = this.getObject('pm_project');
    const existing = await obj.find({
      filters: [['code', 'startswith', prefix]],
      fields: ['code'],
      sort: 'code desc',
      top: 1
    });
    let next = 1;
    if (existing && existing.length > 0 && existing[0].code) {
      const lastSeq = parseInt(existing[0].code.substring(prefix.length), 10);
      if (!isNaN(lastSeq)) next = lastSeq + 1;
    }
    doc.code = `${prefix}${String(next).padStart(3, '0')}`;
  },

  beforeUpdate: async function () {
    const doc = this.doc;
    if (doc.start_date && doc.end_date && new Date(doc.end_date) < new Date(doc.start_date)) {
      throw new Error('截止日期不能早于开始日期');
    }
  },

  afterUpdate: async function () {
    const doc = this.doc;
    const previous = this.previousDoc;
    // When project is closed, cancel all open tasks
    if (doc.status === 'closed' && previous && previous.status !== 'closed') {
      const taskObj = this.getObject('pm_task');
      const openTasks = await taskObj.find({
        filters: [
          ['project', '=', doc._id],
          ['status', 'in', ['todo', 'in_progress']]
        ],
        fields: ['_id']
      });
      for (const t of openTasks) {
        await taskObj.directUpdate(t._id, { status: 'cancelled' });
      }
    }
  }
};
