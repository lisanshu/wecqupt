//detail.js (common)
var app = getApp();
module.exports.ipage = {
  data: {
    remind: "加载中",
    title: "",    // 新闻标题
    date: "",     // 发布日期
    author: "",   // 发布作者
    reading: "",   // 阅读量
    content: "",  // 新闻内容
    files_len: 0,  // 附件数量
    files_list: [],
    file_loading: false, //下载状态
    source: '',   // 附件来源
    sources: {
      'jw': '教务在线',
      'oa': 'OA系统',
      'hy': 'OA系统',
      'jz': 'OA系统',
      'new': '新闻中心'
    }
  },

  convertHtmlToText: function(inputText){
    var returnText = "" + inputText;
    returnText = returnText.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/ /ig, '')
                  .replace(/&mdash/gi,'-').replace(/&ldquo/gi,'“').replace(/&rdquo/gi,'”');
    return returnText;
  },
  
  onLoad: function(options){
    var _this = this;
    
    if(!options.type || !options.id) {
      app.showErrorModal('404');
      _this.setData({
        remind: '404'
      });
      return false;
    }

    wx.request({
      url: app._server + '/api/get_news_detail.php',
      data: options,
      success: function(res){
        if(res.data.status === 200){
          var info = res.data.data;
          // 提取信息中的时间，作者，阅读量
          var author_info = [];
          if(info.author){
            var author_info = info.author.split(' ').map(function(e){
              return e.split(':')[1];
            });
          }
          _this.setData({
            date: author_info[0] || info.time || "",  // 发布日期
            author: author_info[1] || "",     // 发布作者
            reading: author_info[2] || "",    // 阅读量
            title: info.title,            //新闻标题
            content: _this.convertHtmlToText(info.body),  // 新闻内容
            source: _this.data.sources[options.type],
            remind: ''
          })

          // 如果存在附件则提取附件里面的信息
          if(info.fjlist && info.fjlist.length){
            _this.setData({
              files_len: info.fjlist.length,
              files_list: info.fjlist
            });
          }
        }else{
          app.showErrorModal(res.data.message);
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(){
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    })
  },

  getFj: function(e){
    var _this = this;
    _this.setData({
      file_loading: true
    });
    wx.downloadFile({
      url: e.currentTarget.dataset.url,
      success: function(res) {
        var filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('预览文档成功');
          },
          fail: function (res) {
            app.showErrorModal(res.errMsg);
          },
          complete: function (res) {
            _this.setData({
              file_loading: false
            });
          }
        });
      }
    });
  }
};