const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    id: '',
    mode: 'create', // create, view, edit
    title: '',
    content: '',
    status: '待学习',
    loading: false
  },

  onLoad: function(options) {
    const { id, mode } = options;
    this.setData({ 
      id: id || '',
      mode: mode || 'create'
    });

    if (id) {
      this.loadCardDetail(id);
    }
  },

  /**
   * 加载卡片详情
   */
  async loadCardDetail(id) {
    try {
      const res = await db.collection('cards').doc(id).get();
      const { title, content, status } = res.data;
      this.setData({
        title,
        content,
        status
      });
    } catch (err) {
      console.error('加载卡片详情失败：', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 保存卡片
   */
  async saveCard() {
    const { id, title, content, mode } = this.data;

    if (!title || !content) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      if (mode === 'create') {
        await db.collection('cards').add({
          data: {
            title,
            content,
            status: '待学习',
            createTime: db.serverDate(),
            nextReviewDate: db.serverDate()
          }
        });
      } else {
        await db.collection('cards').doc(id).update({
          data: {
            title,
            content,
            updateTime: db.serverDate()
          }
        });
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('保存卡片失败：', err);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }

    this.setData({ loading: false });
  },

  /**
   * 更新复习状态
   */
  async updateReviewStatus(e) {
    const { status } = e.currentTarget.dataset;
    const { id } = this.data;

    let nextInterval;
    switch (status) {
      case '全部记住':
        nextInterval = 7;
        break;
      case '部分记住':
        nextInterval = 3;
        break;
      case '需要重学':
        nextInterval = 1;
        break;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    try {
      await db.collection('cards').doc(id).update({
        data: {
          status,
          nextReviewDate,
          updateTime: db.serverDate()
        }
      });

      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('更新状态失败：', err);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  /**
   * 删除卡片
   */
  async deleteCard() {
    const { id } = this.data;

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确认要删除吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await db.collection('cards').doc(id).remove();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            console.error('删除失败：', err);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 输入处理函数
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  }
}); 