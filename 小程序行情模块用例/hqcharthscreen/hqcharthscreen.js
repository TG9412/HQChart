//index.js
//获取应用实例
const app = getApp()

import { JSCommon } from "../jscommon/umychart.wechat.3.0.js";
import { JSCommonIndexScript } from "../jscommon/umychart.index.data.wechat.js";

var SHOW_INDEX_TITLE = [true, true];

function UnlockIndexCallback(indexData) {
    console.log('[UnlockIndexCallback]', indexData)

    //开通指标权限 ......

    //解锁指标
    var lockData = { IndexName: indexData.Data.IndexName, IsLocked: false };
    indexData.HQChart.LockIndex(lockData);
}

Page(
    {
        data:
        {
            Height: 0,
            Width: 0,

            MinuteChart: { Top: 0, Left: 0, Width: 0, Height: 0, Display: 'none' },
            HistoryChart: { Top: 0, Left: 0, Width: 0, Height: 0, Display: 'block' },
            HQButtonList: 
            {
                Height: 0,
                Button: 
                [
                    { ClassName: 'hqbuttonselected' },
                    { ClassName: 'hqbutton' },
                    { ClassName: 'hqbutton' },
                    { ClassName: 'hqbutton' },
                    { ClassName: 'hqbutton' },
                    { ClassName: 'hqbutton' },
                    { ClassName: 'hqbutton' }
                ]
            },

            KLineTitle: { Index: [{}, {}] }
        },

        Symbol: '600000.sh',
        //Symbol: '00001.hk',

        HistoryChart: null,

        HistoryOption:
        {
            Type: '历史K线图横屏',
            Windows: //窗口指标
            [
                { Index: 'MA', Modify: false, Change: false, TitleHeight: 20 },
                { Index: "VOL", Modify: false, Change: false, TitleHeight: 20 },
                //定制通达信语法指标
                /*{ 
                    Name: '定制指标1', //指标名字
                    Script: 'DATA1:MA(C,N1);DATA2:MA(C,N2);', //指标的通达信脚本
                    Args: [{ Name: 'N1', Value: 7 },{ Name: 'N2', Value: 14 }], //脚本中用到的参数定义
                    
                    Lock:
                    {
                        IsLocked: true,
                        Callback: UnlockIndexCallback,
                        BG: 'rgb(220,220,220)',
                        TextColor: 'rgb(178,34,34)',
                        Text: '🔒开通权限',
                        Font: '12px 微软雅黑'
                    }, 
                    
                    Modify: true, Change: true
                }
                */
            ],
            //Symbol: "00001.hk",
            Symbol: '000001.sz',
            IsAutoUpate: true,       //是自动更新数据

            IsShowCorssCursorInfo: true,    //是否显示十字光标的刻度信息
            //IsShowCorssCursor: false,          //是否显示十字光标
            CorssCursorTouchEnd: true,       //手离开屏幕 隐藏十字光标

            KLine:
            {
                DragMode: 1,                 //拖拽模式 0 禁止拖拽 1 数据拖拽 2 区间选择
                Right: 1,                    //复权 0 不复权 1 前复权 2 后复权
                Period: 0,                   //周期 0 日线 1 周线 2 月线 3 年线
                MaxReqeustDataCount: 1000,   //数据个数
                MaxRequestMinuteDayCount: 15, //分钟数据取天数
                PageSize: 40,               //一屏显示多少数据
                //ShowKLine:false,             //隐藏K线  
            },

            KLineTitle: //标题设置
            {
                IsShowName: true,           //不显示股票名称
                IsShowSettingInfo: true,     //不显示周期/复权
                IsShow: true,                //是否显示
                LineCount:2
            },

            //叠加股票
            Overlay:
            [
                //{ Symbol: '000001.sh' }
            ],

            Border: //边框
            {
                Left: 20,    
                Right: 40,   
                Top: 0,
                Bottom: 70
            },

            Frame:  //子框架设置
            [
                { SplitCount: 3  },
                { SplitCount: 3  }
            ]
        },


        MinuteChart: null,
        MinuteOption:
        {
            Type: '分钟走势图横屏',
            Symbol: "600000.sh",
            IsAutoUpate: true,       //是自动更新数据

            IsShowCorssCursorInfo: true,    //是否显示十字光标的刻度信息
            CorssCursorTouchEnd: true,       //手离开屏幕 隐藏十字光标

            Windows: //窗口指标
            [
                { Index: "KDJ", Modify: false, Change: false, TitleHeight: 20 }
                /*
                //定制通达信语法指标
                {
                    Name: '定制指标1', //指标名字
                    Script: 'DATA1:MA(C,N1);DATA2:MA(C,N2);', //指标的通达信脚本
                    Args: [{ Name: 'N1', Value: 7 }, { Name: 'N2', Value: 14 }], //脚本中用到的参数定义
                    Modify: true, Change: true
                }
                */
            ],

            Border: //边框
            {
                Left: 20,    //左边间距
                Right: 40,     //右边间距
                Top: 50,
                Bottom: 50
            },
                
            MinuteTitle:
            {

            },

            Frame:  //子框架设置,刻度小数位数设置
            [
                { SplitCount: 5 },
                { SplitCount: 3 }
            ]
        },

        JSStock: null,

        Canvas: null,    //画布

        onLoad: function (option) {
            console.log(option);
            var self = this;
            if (option.symbol != null) this.Symbol = option.symbol;
            // 获取系统信息
            wx.getSystemInfo({
                success: function (res) {
                    console.log(res);
                    // 可使用窗口宽度、高度
                    console.log('height=' + res.windowHeight);
                    console.log('width=' + res.windowWidth);

                    var toolbarWidth=45;
                    var chartTop = 0;
                    var chartHeight = res.windowHeight;
                    self.setData({ Height: res.windowHeight, Width: res.windowWidth });

                    var minuteChart = { Top: chartTop, Left: 0, Width: res.windowWidth, Height: chartHeight, Display: 'block' };
                    self.setData({ MinuteChart: minuteChart });

                    var historyChart = { Top: chartTop, Left: 0, Width: res.windowWidth, Height: chartHeight, Display: 'none' };
                    self.setData({ HistoryChart: historyChart });

                    var hqButtonList = {
                        Left: res.windowWidth - toolbarWidth,
                        Height: toolbarWidth,
                        Button: [
                            { ClassName: 'hqbutton' },
                            { ClassName: 'hqbutton' },
                            { ClassName: 'hqbutton' },
                            { ClassName: 'hqbutton' },
                            { ClassName: 'hqbutton' },
                            { ClassName: 'hqbutton' },
                            { ClassName: 'hqbutton' }
                        ]
                    }
                    self.setData({ HQButtonList: hqButtonList });
                }
            });

        },

        onReady: function () {

            wx.setNavigationBarTitle({ title: this.Symbol });
            this.ShowMinuteChart(1);
        },


        //K线图事件
        historytouchstart: function (event) {
            if (this.HistoryChart) this.HistoryChart.OnTouchStart(event);
        },
        historytouchmove: function (event) {
            if (this.HistoryChart) this.HistoryChart.OnTouchMove(event);
        },
        historytouchend: function (event) {
            if (this.HistoryChart) this.HistoryChart.OnTouchEnd(event);
            //手势结束显示标签按钮
            var buttonList = this.data.HQButtonList;
            buttonList.Display = 'block';
            this.setData({ HQButtonList: buttonList });
        },

        //走势图事件
        minutetouchstart: function (event) {
            if (this.MinuteChart) this.MinuteChart.OnTouchStart(event);
        },
        minutetouchmove: function (event) {
            if (this.MinuteChart) this.MinuteChart.OnTouchMove(event);
        },
        minutetouchend: function (event) {
            if (this.MinuteChart) this.MinuteChart.OnTouchEnd(event);
            //手势结束显示标签按钮
            var buttonList = this.data.HQButtonList;
            buttonList.Display = 'block';
            this.setData({ HQButtonList: buttonList });
        },

        MinuteTitleUpdate: function (data) {
            console.log(data);
            if (!data.CallFunction) return;

            var buttonList = this.data.HQButtonList;

            switch (data.CallFunction) {
                case 'Draw':    //十字光标的时候画动态标题
                    buttonList.Display = 'none';
                    this.setData({ HQButtonList: buttonList });
                    break;
            }
        },

        KLineTitleUpdate: function (data) {
            this.MinuteTitleUpdate(data);
        },

        //保存图片
        SaveImageCallback: function (data) {
            console.log(data);
        },

        ShowMinuteChart: function (dayCount) {
            var minuteChart = this.data.MinuteChart;
            minuteChart.Display = 'block';

            var historyChart = this.data.HistoryChart;
            historyChart.Display = 'none';

            if (this.HistoryChart) {
                this.HistoryChart.SaveToImage(this.SaveImageCallback);
            }

            this.setData({ MinuteChart: minuteChart });
            this.setData({ HistoryChart: historyChart });

            var index=dayCount>1?1:0;
            var hqButtonList = this.data.HQButtonList;
            for (var i in hqButtonList.Button) 
            {
                var item = hqButtonList.Button[i];
                if (i == index) item.ClassName = 'hqbuttonselected';
                else item.ClassName = 'hqbutton';
            }
            this.setData({ HQButtonList: hqButtonList });

            if (this.MinuteChart == null) {
                //创建走势图类
                var element2 = new JSCommon.JSCanvasElement();
                element2.ID = 'minutechart';
                element2.Height = this.data.MinuteChart.Height;  //高度宽度需要手动绑定!!
                element2.Width = this.data.MinuteChart.Width;

                this.MinuteChart = JSCommon.JSChart.Init(element2);
                this.MinuteOption.Symbol = this.Symbol;
                this.MinuteOption.DayCount=dayCount;
                this.MinuteOption.MinuteTitle.UpdateUICallback = this.MinuteTitleUpdate;
                this.MinuteChart.SetOption(this.MinuteOption);
            }
            else
            {
                this.MinuteChart.ChangeDayCount(dayCount);
            }
        },

        //显示K线图 period=周期
        ShowHistoryChart: function (period) {
            var minuteChart = this.data.MinuteChart;
            minuteChart.Display = 'none';

            var historyChart = this.data.HistoryChart;
            historyChart.Display = 'block';

            this.setData({ MinuteChart: minuteChart });
            this.setData({ HistoryChart: historyChart });

            var index = period + 2;
            if (period == 5) index = 5;
            else if (period == 7) index = 6;
            var hqButtonList = this.data.HQButtonList;
            for (var i in hqButtonList.Button) {
                var item = hqButtonList.Button[i];
                if (i == index) item.ClassName = 'hqbuttonselected';
                else item.ClassName = 'hqbutton';
            }
            this.setData({ HQButtonList: hqButtonList });

            if (this.HistoryChart == null) {
                //创建历史K线类
                var element = new JSCommon.JSCanvasElement();
                element.ID = 'historychart';
                element.Height = this.data.HistoryChart.Height;   //高度宽度需要手动绑定!! 微信没有元素类
                element.Width = this.data.HistoryChart.Width;

                let scriptData = new JSCommonIndexScript.JSIndexScript();

                this.HistoryChart = JSCommon.JSChart.Init(element);
                this.HistoryOption.KLine.Period = period;
                this.HistoryOption.Symbol = this.Symbol;
                this.HistoryOption.KLineTitle.UpdateUICallback = this.KLineTitleUpdate;
                this.HistoryOption.Windows[1].UpdateUICallback = this.UpdateIndexUI;
               
                this.HistoryChart.SetOption(this.HistoryOption);
            }
            else 
            {
                this.HistoryChart.ChangePeriod(period);
            }
        },

        UpdateIndexUI: function (data) {
            console.log('UpdateIndexUI', data);
        },

        //获取文本宽度
        GetTextData: function (value) 
        {
            let data = { Value: value, Width: 0 };
            if (value != null) {
                //data.Width = this.Canvas.measureText(value.toString()).width+5;
                data.Width = value.toString().length * 10 + 5;
            }
            return data;
        },

        //
        onclickhqbutton: function (event) {
            console.log(event);
            switch (event.target.id) {
                case 'showminute':
                    this.ShowMinuteChart(1);
                    break;
                case 'show5day':
                    this.ShowMinuteChart(5);
                    break;
                case 'showday':
                    this.ShowHistoryChart(0);
                    break;
                case 'showweek':
                    this.ShowHistoryChart(1);
                    break;
                case 'showmonth':
                    this.ShowHistoryChart(2);
                    break;
                case 'showminute5':
                    this.ShowHistoryChart(5);
                    break;
                case 'showminute30':
                    this.ShowHistoryChart(7);
                    break;
            }
        }
    })
