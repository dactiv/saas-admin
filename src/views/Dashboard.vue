<template>
  <div>

    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-dashboard" /> 仪表盘</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row :gutter="[16,16]" class="margin-md-bottom">

      <a-col :span="24" v-if="this.principal.hasPermission('perms[chapter_class_hour_content:statistics_views_trend]')">
        <a-card title="每日学习课程人数">
          <template #extra>
            <a-range-picker size="small" v-model:value="this.char.onlineUser.dateRange" :format="this.POST_DATE_FORMAT" :value-format="this.POST_DATE_FORMAT" @change="onOnlineUserDateRangeChange"/>
          </template>
          <div id="online-user" style="height: 300px">
            <a-row v-if="this.char.onlineUser.empty" class="height-100-percent" type="flex" justify="space-around" align="middle">
              <a-col :span="24">
                <a-spin :spinning="this.char.onlineUser.spinning">
                  <a-empty />
                </a-spin>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>

      <a-col :span="24" v-if="this.principal.hasPermission('perms[curriculum:statistics]')">
        <a-card title="本学期课程数据">
          <template #extra>
            <a-range-picker size="small" v-model:value="this.char.curriculumData.dateRange" :format="this.POST_DATE_FORMAT" :value-format="this.POST_DATE_FORMAT" @change="onCurriculumDataChange"/>
          </template>
          <a-spin :spinning="this.char.curriculumData.spinning">
            <a-row :gutter="[16,0]">
              <a-col :span="14">
                <div id="curriculum-data" style="height: 300px">
                  <a-row v-if="this.char.curriculumData.empty" class="height-100-percent" type="flex" justify="space-around" align="middle">
                    <a-col :span="24">
                        <a-empty />
                    </a-col>
                  </a-row>
                </div>
              </a-col>
              <a-col :span="10">
                <a-table class="ant-table-striped" size="small" :scroll="{y:180, x: this.char.curriculumData.table.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.char.curriculumData.table.dataSource" :columns="this.char.curriculumData.table.columns" bordered>
                  <template #title>
                    类目数据
                  </template>
                  <template #summary>
                    <a-table-summary fixed>
                      <a-table-summary-row>
                        <a-table-summary-cell :index="0">去重总数:</a-table-summary-cell>
                        <a-table-summary-cell :index="1">{{ this.char.curriculumData.table.totalCount}}</a-table-summary-cell>
                      </a-table-summary-row>
                    </a-table-summary>
                  </template>
                </a-table>
              </a-col>
            </a-row>
          </a-spin>
        </a-card>
      </a-col>

      <a-col :span="this.principal.hasPermission('perms[user_file:statistics_top]') ? 12 : 24" v-if="this.principal.hasPermission('perms[curriculum:statistics_top]')">
        <a-card :bodyStyle="{padding:0, minHeight:'325px'}" :tab-list="this.top.curriculum.tabList" @tabChange="onCurriculumTabChange" :active-tab-key="this.top.curriculum.activeTabKey" >
          <template #customTab="item">
            <a-tooltip>
              <template #title>{{item.tooltip}}</template>
              <icon-font class="icon" :type="item.icon" />
              {{ item.tab }}
            </a-tooltip>
          </template>
          <a-list item-layout="horizontal" :loading="this.top.curriculum.loading" size="small" :data-source="this.top.curriculum[this.top.curriculum.activeTabKey]">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <template #actions>
                  {{item.count}}次
                </template>
                <a-list-item-meta>
                  <template #avatar>
                    <a-typography-title v-if="index >= 3" class="font-oblique normal-color" :level="3">{{ index + 1 }}</a-typography-title>
                    <icon-font class="icon ranking margin-xs-top" v-else :type="'icon-curriculum_ranking_' + (index + 1)" />
                  </template>
                  <template #description>
                    <a-typography-text :ellipsis="true" :content="item.description" />
                  </template>
                  <template #title>
                    <router-link :to="{name:'resources_curriculum_detail', query:{id:item.id}}">
                      <a-typography-link :ellipsis="true" :content="item.name" />
                    </router-link>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="this.principal.hasPermission('perms[curriculum:statistics_top]') ? 12 : 24" v-if="this.principal.hasPermission('perms[user_file:statistics_top]')">
        <a-card :bodyStyle="{padding:0, minHeight:'324px'}" title="资料下载 TOP 5">
          <template #extra>
            <icon-font class="icon" type="icon-download" />
          </template>
          <a-list item-layout="horizontal" :loading="this.top.downloadResource.loading"  size="small" :data-source="this.top.downloadResource.dataSources">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <template #actions>
                  <a-space>
                    <span>{{item.username}}</span>
                    <a-avatar :src="'/api/resources/avatar/get?filename=' + item.userType + '/' + item.userId + '/current&date=' + this.$dayjs().unix()" />
                  </a-space>
                </template>
                <a-list-item-meta>
                  <template #avatar>
                    <a-typography-title v-if="index >= 3" class="font-oblique normal-color" :level="3">{{ index + 1 }}</a-typography-title>
                    <icon-font class="icon ranking margin-xs-top" v-else :type="'icon-curriculum_ranking_' + (index + 1)" />
                  </template>
                  <template #description>
                    下载次数:{{item.downloadsCount}} 浏览次数: {{item.viewsCount}}
                  </template>
                  <template #title>
                    <a-typography-link :ellipsis="true" :content="item.name" />
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="this.principal.hasPermission('perms[resource_system:statistics_keyword]') ? 8 : 24" v-if="this.principal.hasPermission('perms[organization_statistics:count_student_and_teacher]')">
        <a-card title="学校人员情况">
          <template #extra>
            <icon-font class="icon opacity" type="icon-group" />
          </template>
          <div id="total-people" style="height: 300px">
            <a-row v-if="this.char.totalPeople.empty" class="height-100-percent" type="flex" justify="space-around" align="middle">
              <a-col :span="24">
                <a-spin :spinning="this.char.totalPeople.spinning">
                  <a-empty />
                </a-spin>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>

      <a-col :span="this.principal.hasPermission('perms[organization_statistics:count_student_and_teacher]') ? 16 : 24" v-if="this.principal.hasPermission('perms[resource_system:statistics_keyword]')">
        <a-card title="热搜关键字">
          <template #extra>
            <icon-font class="icon opacity" type="icon-seach" />
          </template>
          <div id="hot-keyword" style="height: 300px">
            <a-row v-if="true" class="height-100-percent" type="flex" justify="space-around" align="middle">
              <a-col :span="24">
                <a-spin :spinning="this.char.hotKeyword.spinning">
                  <a-empty />
                </a-spin>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>

    </a-row>
  </div>
</template>

<script>

import * as echarts from 'echarts';
import 'echarts-wordcloud'
import store from "@/store";

export default {
  name: "Dashboard",
  data() {
    return {
      top:{
        curriculum: {
          loading:false,
          activeTabKey:"notLimitedTime",
          tabList:[{
            key: 'notLimitedTime',
            tab: '热门非限时课程 TOP 5',
            icon:'icon-hot-o',
            tooltip:"非限时热门课程统计规则为:不包含选课开始与结束时间的所有课程排名"
          },{
            key: 'limitedTime',
            tab: '热门限时课程 TOP 5',
            icon:'icon-like',
            tooltip:"限时热门课程统计规则为:包含选课开始与结束时间的所有课程排名"
          }],
          limitedTime:[],
          notLimitedTime:[]
        },
        downloadResource:{
          loading:false,
          dataSources:[]
        }
      },
      char:{
        curriculumData:{
          spinning:false,
          empty:true,
          dateRange:[],
          table:{
            dataSource:[],
            columns:[
              {
                title: "类别名称",
                dataIndex: "name",
                ellipsis: true,
              },
              {
                title: "个数",
                dataIndex: "value",
                ellipsis: true,
              }
            ],
          },
          option: {
            color:[
              this.$store.state.theme.color.green,
              this.$store.state.theme.color.cyan,
              this.$store.state.theme.color.yellow,
              this.$store.state.theme.color.error,
              this.$store.state.theme.color.greyBlue,
              this.$store.state.theme.color.purple
            ],
            toolbox: {
              feature: {
                saveAsImage: {}
              }
            },
            title:{
              text:"",
              left:"center",
              top:"50%",
              textStyle:{
                fontSize:14,
                align:"center"
              }
            },
            tooltip: {
              trigger: 'item',
              formatter:"{b}: {c} 个，占比: {d}%",
            },
            legend: {
              top: 4,
              textStyle:{
                fontSize: 14
              },
              left: 'center',
              formatter:this.curriculumDataLegendFormatter
            },
            labelLine: {
              show: false
            },
            series: [
              {
                type: 'pie',
                top: 45,
                radius: ['60%', '90%'],
                itemStyle: {
                  borderRadius: 16,
                },
                label: {
                  show: false
                },
                data: []
              }
            ]
          },
        },
        totalPeople:{
          spinning:false,
          empty:true,
          option: {
            toolbox: {
              feature: {
                saveAsImage: {}
              }
            },
            title:{
              text:"",
              left:"center",
              top:"45%",
              textStyle:{
                fontSize:14,
                align:"center"
              }
            },
            color:[
              this.$store.state.theme.color.blue,
              this.$store.state.theme.color.green,
            ],
            tooltip: {
              trigger: 'item',
              formatter:"{b}: {c} 个，占比: {d}%",
            },
            legend: {
              top: 4,
              textStyle:{
                fontSize: 14
              },
              left: 'center',
            },
            labelLine: {
              show: false
            },
            series: [
              {
                type: 'pie',
                top: 45,
                radius: ['50%', '80%'],
                itemStyle: {
                  borderRadius: 16
                },
                label: {
                  show: false,
                  position: 'center'
                },
                data: []
              }
            ]
          },
        },
        onlineUser:{
          spinning:false,
          empty:false,
          dateRange:[],
          option:{
            color:[
              this.$store.state.theme.color.blue,
              this.$store.state.theme.color.green,
            ],
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: []
            },
            yAxis: {
              type: 'value'
            },
            grid: {
              top:70,
              left: 30,
              right:40,
              bottom:0,
              containLabel: true
            },
            legend: {
              textStyle:{
                fontSize: 14
              },
              data: [ '本月在线人数情况', '上月在线人数情况']
            },
            toolbox: {
              feature: {
                saveAsImage: {}
              }
            },
            series: [
              {
                name: '本月在线人数情况',
                type: 'line',
                areaStyle: {},
                data: [],
              },
              {
                name: '上月在线人数情况',
                type: 'line',
                areaStyle: {},
                data: [],
              }
            ]
          }
        },
        hotKeyword: {
          spinning: false,
          empty: false,
          colors: [
            this.$store.state.theme.color.blue,
            this.$store.state.theme.color.purple,
            this.$store.state.theme.color.cyan,
            this.$store.state.theme.color.green,
            this.$store.state.theme.color.magenta,
            this.$store.state.theme.color.red,
            this.$store.state.theme.color.orange,
            this.$store.state.theme.color.yellow,
            this.$store.state.theme.color.volcano,
            this.$store.state.theme.color.greyBlue,
            this.$store.state.theme.color.lime,
            this.$store.state.theme.color.gold,
          ],
          option: {
            tooltip: {
              show: true,
              formatter:"关键字: [{b}], 查询 {c} 次",
            },
            toolbox: {
              feature: {
                saveAsImage: {}
              }
            },
            series: [
              {
                type: 'wordCloud',
                sizeRange: [10, 50],         //  词典字体大小范围配置
                rotationRange: [0, 0],       // 词典字体旋转角度配置，默认不旋转
                shape: 'circle',
                // 渲染词典数据
                data: []
              }
            ]
          }
        }
      },
    }
  },
  methods:{
    curriculumDataLegendFormatter(name) {
      let data = this.char.curriculumData.option.series[0].data.find(d => d.name === name);
      if (data) {
        return name + " " + data.value + " 个";
      }
      return name;
    },
    onCurriculumTabChange(key) {
      this.top.curriculum.activeTabKey = key;
    },
    onCurriculumDataChange() {
      this.loadCurriculumData();
    },
    onOnlineUserDateRangeChange() {
      this.loadOnlineUserTrend();
    },
    loadTotalPeoplePie() {
      if (!this.principal.hasPermission('perms[organization_statistics:count_student_and_teacher]')) {
        return ;
      }
      this.char.totalPeople.spinning = true;
      this.$http.get("/api/authentication/statistics/countStudentAndTeacher").then(r => {
        this.char.totalPeople.spinning = false;
        if (!r.data.data) {
          this.char.totalPeople.empty = true;
          return ;
        }
        this.char.totalPeople.option.series[0].data = [];
        let resourceTeacherCount = 0;
        for (let key in r.data.data) {
          if (key === '网课教师') {
            resourceTeacherCount = r.data.data[key];
            continue;
          }
          this.char.totalPeople.option.series[0].data.push({name: key, value: r.data.data[key]});
        }

        this.char.totalPeople.option.title.text = '总人数:' + this.char.totalPeople.option.series[0].data.reduce((sum, c) => sum + c.value, 0) + "\n\n" + "网课教师人数:" + resourceTeacherCount;

        let totalPeoplePieDom = echarts.init(document.getElementById('total-people'));
        totalPeoplePieDom.setOption(this.char.totalPeople.option);

        this.char.totalPeople.empty = false;
      }).catch(() => {
        this.char.totalPeople.spinning = false;
        this.char.totalPeople.empty = true;
      });
    },
    loadOnlineUserTrend() {
      if (!this.principal.hasPermission('perms[chapter_class_hour_content:statistics_views_trend]')) {
        return ;
      }

      this.char.onlineUser.spinning = true;
      let param = {};
      if (this.char.onlineUser.dateRange[0]) {
        param.startTime = this.char.onlineUser.dateRange[0];
      }
      if (this.char.onlineUser.dateRange[1]) {
        param.endTime = this.char.onlineUser.dateRange[1];
      }
      this
          .$http
          .post("/api/resources/curriculum/chapter/class/hour/content/statisticsViewsTrend", this.formUrlEncoded(param))
          .then(r => {

            this.char.onlineUser.spinning = false;
            let dateRangeDescribe = r.data.data;
            if (!dateRangeDescribe) {
              this.char.onlineUser.empty = true;
              return ;
            }

            this.char.onlineUser.option.xAxis.data = [];
            this.char.onlineUser.option.series[0].data = [];
            this.char.onlineUser.option.series[1].data = [];

            if (dateRangeDescribe.data) {
              for (let key in dateRangeDescribe.data) {
                this.char.onlineUser.option.xAxis.data.push(key);
                let data = dateRangeDescribe.data[key];
                this.char.onlineUser.option.series[0].data.push(data[0]);
                this.char.onlineUser.option.series[1].data.push(data[1]);
              }
              this.setTrendChartMarkPoint(this.char.onlineUser.option.series[0], "本月最高峰");
              this.setTrendChartMarkPoint(this.char.onlineUser.option.series[1], "上月最高峰");

              this.char.onlineUser.empty = false;

              let charts = echarts.init(document.getElementById("online-user"));
              charts.setOption(this.char.onlineUser.option);
            }

            this.char.onlineUser.dateRange = [
              this.$dayjs(dateRangeDescribe.range.minimum).format(this.POST_DATE_FORMAT),
              this.$dayjs(dateRangeDescribe.range.maximum).format(this.POST_DATE_FORMAT)
            ]
          })
          .catch(() => {
            this.char.onlineUser.spinning = false;
            this.char.onlineUser.empty = true;
          });
    },
    loadCurriculumData() {

      if (!this.principal.hasPermission('perms[curriculum:statistics]')) {
        return ;
      }

      this.char.curriculumData.spinning = true;
      let param = {};
      if (this.char.curriculumData.dateRange[0]) {
        param.startTime = this.char.curriculumData.dateRange[0];
      }
      if (this.char.curriculumData.dateRange[1]) {
        param.endTime = this.char.curriculumData.dateRange[1];
      }
      this.$http.post("/api/resources/curriculum/statistics", this.formUrlEncoded(param)).then(r => {
        this.char.curriculumData.spinning = false;
        if (!r.data.data) {
          this.char.curriculumData.empty = true;
          return ;
        }
        this.char.curriculumData.option.series[0].data = [];
        for (let key in r.data.data.statusPie) {
          this.char.curriculumData.option.series[0].data.push({name: key, value: r.data.data.statusPie[key]});
        }

        this.char.curriculumData.table.dataSource = [];
        for (let key in r.data.data.categoryPie) {
          this.char.curriculumData.table.dataSource.push({name:key, value: r.data.data.categoryPie[key]})
        }
        this.char.curriculumData.table.totalCount = r.data.data.count;
        this.char.curriculumData.option.title.text = '总课程:' + this.char.curriculumData.table.totalCount + "\n\n" + "参与人数:" + r.data.data.participantCount;

        let dom = echarts.init(document.getElementById('curriculum-data'));
        dom.setOption(this.char.curriculumData.option);

        this.char.curriculumData.dateRange = [
          this.$dayjs(r.data.data.range.minimum).format(this.POST_DATE_FORMAT),
          this.$dayjs(r.data.data.range.maximum).format(this.POST_DATE_FORMAT)
        ]

        this.char.curriculumData.empty = false;
      }).catch(() => {
        this.char.curriculumData.spinning = false;
        this.char.curriculumData.empty = true;
      });
    },
    loadCurriculumTop() {
      if (!this.principal.hasPermission('perms[curriculum:statistics_top]')) {
        return ;
      }

      this.top.curriculum.loading = true;
      this
          .$http
          .post("/api/resources/curriculum/statisticsTop", this.formUrlEncoded({number:5}))
          .then(r => {
            this.top.curriculum.limitedTime = r.data.data.limitedTime || [];
            this.top.curriculum.notLimitedTime = r.data.data.notLimitedTime || [];
            this.top.curriculum.loading = false;
          }).catch(() => this.top.curriculum.loading = false)
    },
    loadTopResource() {
      if (!this.principal.hasPermission('perms[user_file:statistics_top]')) {
        return ;
      }
      this.top.downloadResource.loading = true;
      this
          .$http
          .post("/api/resources/user/file/statisticsTop", this.formUrlEncoded({number:5}))
          .then(r => {
            this.top.downloadResource.dataSources = r.data.data.elements || [];
            this.top.downloadResource.loading = false;
          }).catch(() => this.top.downloadResource.loading = false)
    },
    loadHotKeyword() {
      if (!this.principal.hasPermission('perms[resource_system:statistics_keyword]')) {
        return ;
      }
      this.char.hotKeyword.spinning = true;
      this
          .$http
          .get("/api/resources/system/statisticsKeyword")
          .then(r => {
            let data = r.data.data || [];
            for (let index = 0; index < data.length; index++) {
              this.char.hotKeyword.option.series[0].data.push({
                name:data[index].id,
                value:data[index].value * 1,
                textStyle: {          // 单独配置某个词典样式
                  color: index < this.char.hotKeyword.colors.length ? this.char.hotKeyword.colors[index] : this.$store.state.theme.color.blue
                }
              });
            }

            let dom = echarts.init(document.getElementById('hot-keyword'));
            dom.setOption(this.char.hotKeyword.option);

            this.char.hotKeyword.spinning = false;
            this.char.hotKeyword.empty = this.char.hotKeyword.option.series[0].data.length <= 0;
          }).catch(() => {
            this.char.hotKeyword.spinning = false;
            this.char.hotKeyword.empty = true;
          })
    }
  },
  mounted() {
    this.loadTotalPeoplePie();
    this.loadOnlineUserTrend();
    this.loadCurriculumData();
    this.loadTopResource();
    this.loadHotKeyword();
  },
  created() {
    this.loadCurriculumTop();
  }
}
</script>