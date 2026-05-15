const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    cardList: [],
    loading: true
  },

  onLoad: function() {
    this.loadTodayCards();
  },

  onShow: function() {
    this.loadTodayCards();
  },

  /**
   * 加载今天需要复习的卡片
   */
  async loadTodayCards() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const res = await db.collection('cards')
        .where({
          // 云数据库建议配置为“仅创建者可读写”，客户端无需手写 _openid 占位符
          nextReviewDate: db.command.lte(today)
        })
        .orderBy('nextReviewDate', 'asc')
        .get();

      this.setData({
        cardList: res.data,
        loading: false
      });
    } catch (err) {
      console.error('加载卡片失败：', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 创建新卡片
   */
  onCreateCard() {
    wx.navigateTo({
      url: '/pages/card-detail/index?mode=create'
    });
  },

  /**
   * 查看卡片详情
   */
  onViewCard(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/card-detail/index?id=${id}&mode=view`
    });
  }
}); 