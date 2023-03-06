<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 工作台</a-breadcrumb-item>
    </a-breadcrumb>

    <a-row :gutter="[16,16]" class="margin-md-bottom">
      <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12" v-if="this.work.tabList.length > 0">
        <a-card size="small" :bordered="false" class="border-split-top border-split-left border-split-right" :tab-list="this.work.tabList" :active-tab-key="this.work.activeTabKey" @tabChange="onWorkflowTabChange" :bodyStyle="{padding:0}">
          <template #customTab="item">
            <icon-font class="icon" :type="item.icon" />
            {{ item.tab }}
          </template>
          <a-table :loading="this.work[this.work.activeTabKey].loading" :rowKey="record=>record.id" :scroll="{ x: this.work[this.work.activeTabKey].columns.reduce((sum, c) => sum + c.width, 0)}" :pagination="false" :data-source="this.work[this.work.activeTabKey].dataSource" :columns="this.work[this.work.activeTabKey].columns">
            <template #emptyText>
              <a-row style="height: 252px" type="flex" justify="space-around" align="middle">
                <a-col :span="24">
                  <a-empty />
                </a-col>
              </a-row>
            </template>
            <template #bodyCell="{ column, record }">

              <template v-if="column.dataIndex === 'creationTime'">
                {{ this.dateFormat(record.creationTime) }}
              </template>

              <template v-if="column.dataIndex === 'username'">
                {{record.apply.username}}
              </template>

              <template v-if="column.key === 'action'">
                <div class="text-center">
                  <a-space>
                    <a-button type="link" size="small" @click="workDetail(record)">
                      <icon-font class="icon" type="icon-file" />
                      <span class="hidden-xs hidden-sm hidden-md">详情</span>
                    </a-button>
                  </a-space>
                </div>
              </template>

            </template>

          </a-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="24" :md="this.work.tabList.length <= 0 ? 24 : 12" :lg="this.work.tabList.length <= 0 ? 24 : 12" :xl="this.work.tabList.length <= 0 ? 24 : 12" :xxl="this.work.tabList.length <= 0 ? 24 : 12">
        <a-card size="small" :style="{height: '382px'}" :bodyStyle="{padding:'1px 0 0 0'}" title="新闻公告">
          <template #extra>
            <icon-font class="icon" type="icon-dynamic" />
          </template>
          <a-table :loading="this.newsOrNotice.loading" :rowKey="record=>record.id" :scroll="{ x: 220 }" :pagination="false" :data-source="this.newsOrNotice.dataSource" :columns="this.newsOrNotice.columns">
            <a-row style="height: 252px" type="flex" justify="space-around" align="middle">
              <a-col :span="24">
                <a-empty />
              </a-col>
            </a-row>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'creationTime'">
                {{ this.dateFormat(record.creationTime) }}
              </template>

              <template v-if="column.key === 'action'">
                <div class="text-center">
                  <a-space>
                    <a-button type="link" size="small" @click="newsDetail(record)">
                      <icon-font class="icon" type="icon-file" />
                      <span class="hidden-xs hidden-sm hidden-md">详情</span>
                    </a-button>
                  </a-space>
                </div>
              </template>

            </template>

          </a-table>
        </a-card>
      </a-col>

      <a-col :span="24">
        <a-card size="small" :bodyStyle="{padding:'2px'}" title="日程管理">
          <template #extra>
            <a-button type="primary" size="small" :disabled="!this.principal.hasPermission('perms[schedule:save]')" @click="detailSchedule()">
              <icon-font type="icon-date-range" />
              <span class="hidden-xs hidden-sm hidden-md">添加日程</span>
            </a-button>
          </template>
          <a-calendar v-model:value="this.calendarValue" @panelChange="calendarPanelChange">
            <template #dateFullCellRender="{current}">
              <div class="ant-picker-cell-inner ant-picker-calendar-date">
                <div class="ant-picker-calendar-date-value">
                  <a-row>
                    <a-col :span="20" class="text-left">
                      {{this.getSolarDay(current)}}
                    </a-col>
                    <a-col :span="4">
                      {{current.date()}}
                    </a-col>
                  </a-row>
                </div>
                <div class="ant-picker-calendar-date-content">
                  <a-tag class="width-100-percent" :color="this.$store.state.theme.color.greyBlue" v-if="this.getSolarDayName(current)">
                    <span >{{this.getSolarDayName(current)}}</span>
                  </a-tag>
                  <a-tag class="width-100-percent" :color="this.$store.state.theme.color.green" v-if="this.getSolarFestival(current)">
                    <span >{{this.getSolarFestival(current)}}</span>
                  </a-tag>
                  <a-tag class="width-100-percent margin-xss-bottom" @click="this.detailSchedule(item.id, $event)" v-for="(item,index) of getScheduleData(current)" :key="item.id" :color="this.schedule.colors[index % this.schedule.colors.length + 1]">{{item.name}}</a-tag>
                </div>
              </div>
            </template>
          </a-calendar>
        </a-card>
      </a-col>
    </a-row>

  </div>
</template>

<script>

import {calendar} from "js-calendar-converter";

export default {
  name: "Workbench",
  created() {
    if (this.principal.hasPermission("perms[work:my_pending]")) {
      this.work.tabList.push({
        key: 'myPending',
        tab: '我的待办',
        icon:'icon-more',
        perms:"perms[work:my_pending]"
      });
    }
    if (this.principal.hasPermission("perms[work:copy_me]")) {
      this.work.tabList.push({
        key: 'myProcessed',
        tab: '我的经办',
        icon:'icon-enum-major-o',
        perms:"perms[work:my_processed]"
      });
    }
    if (this.principal.hasPermission("perms[work:my_submit]")) {
      this.work.tabList.push({
        key: 'mySubmit',
        tab: '我提交的',
        icon:'icon-complete',
        perms:"perms[work:my_submit]"
      });
    }
    if (this.principal.hasPermission("perms[work:my_processed]")) {
      this.work.tabList.push({
        key: 'copyMe',
        tab: '我收到的',
        icon:'icon-share',
        perms:"perms[work:copy_me]"
      });
    }
    this.$http.post("/api/workflow/group/find?body=true").then((r) => this.apply.dataSource = r.data.data);
    if (this.work.tabList.length > 0) {
      this.work.activeTabKey = this.work.tabList[0].key;
      this.loadWorkflowDataSource(this.work.activeTabKey);
    }

    this.newsOrNotice.loading = true;
    this
        .$http
        .post("/api/message/notice/page",this.formUrlEncoded({number:1, size:5}))
        .then(r => {
          this.newsOrNotice.dataSource = r.data.data.elements;
          this.newsOrNotice.loading = false
        })
        .catch(() => this.newsOrNotice.loading= false);
    let scheduleParam = {
      "filter_[start_time_gte]":this.$dayjs().startOf('month').format(this.POST_DATETIME_FORMAT),
      "filter_[start_time_lte]":this.$dayjs().endOf('month').format(this.POST_DATETIME_FORMAT),
    };
    this.$http.post("/api/workflow/schedule/find", this.formUrlEncoded(scheduleParam)).then(r => {
      this.schedule.dataSource = r.data.data || [];
      this.schedule.dataSource.forEach(d => {
        d.startTime = this.$dayjs(d.startTime);
        d.endTime = this.$dayjs(d.endTime);
      });
    });
    //this.getHolidayData(this.$dayjs().year());
  },
  methods:{
    calendarPanelChange(date) {
      this.getHolidayData(date.year());
    },
    getHolidayData(year) {
      if (!this.schedule.holiday[year]) {
        this.doGetHolidayData(year);
      }

      if (!this.schedule.holiday[year - 1]) {
        this.doGetHolidayData(year - 1);
      }

      if (!this.schedule.holiday[year + 1]) {
        this.doGetHolidayData(year + 1);
      }
    },
    doGetHolidayData(year) {
      this.$http.get("/api/workflow/schedule/holiday?year=" + year).then(r => {
        if (!r.data.data) {
          return ;
        }
        this.schedule.holiday[year.toString()] = r.data.data.map(d => {
          return {
            begin:this.$dayjs(d.begin, "YYYYMMDD").hour(0).minute(0).second(0),
            end:this.$dayjs(d.end, "YYYYMMDD").hour(23).minute(59).second(59),
            holiday:d.holiday
          }
        });
      });
    },
    getScheduleData(currentDate) {
      let date = currentDate.hour(0).minute(0).second(0).millisecond(0);
      return this.schedule.dataSource.filter(d => date.isAfter(d.startTime) && date.isBefore(d.endTime));
    },
    getSolarDayName(currentDate) {
      return calendar.solar2lunar(currentDate.year(), currentDate.month() + 1, currentDate.date()).Term;
    },
    getSolarFestival(currentDate) {
      let lunar = calendar.solar2lunar(currentDate.year(), currentDate.month() + 1, currentDate.date());
      return lunar.festival || lunar.lunarFestival || "";
    },
    getSolarDay(currentDate) {
      return calendar.solar2lunar(currentDate.year(), currentDate.month() + 1, currentDate.date()).IDayCn;
    },
    detailSchedule(id, e) {
      if (e) {
        e.stopPropagation();
      }

      let to = {
        name: "workflow_schedule_edit"
      }

      if (id !== undefined) {
        to.query = {id:id};
      }

      this.$router.push(to);
    },
    workDetail(record) {
      let to = {
        path: "workflow/apply/detail"
      }

      if (record !== undefined) {
        to["query"] = {id:JSON.stringify([record.apply.id]), from:'workbench'};
      }

      this.$router.push(to);
    },
    newsDetail(record) {
      window.open(this.FRONT_END_URL + "/news/details/" + record.id, "_blank");
    },
    onWorkflowTabChange(key) {
      this.work.activeTabKey = key;

      let target = this.work[this.work.activeTabKey];
      if (!target) {
        return ;
      }

      if (target.dataSource.length <= 0) {
        this.loadWorkflowDataSource(this.work.activeTabKey);
      }
    },
    loadWorkflowDataSource(key) {
      this.work[key].loading = true;
      this
          .$http
          .post("/api/workflow/work/" + key, this.formUrlEncoded({number:1, size:5}))
          .then(r => {
            this.work[key].dataSource = r.data.data.elements;
            this.work[key].loading = false;
          })
          .catch(() => this.work[key].loading = false);
    }
  },
  data() {
    return {
      apply:{
        loading:false,
        dataSource:[]
      },
      schedule:{
        dataSource:[],
        holiday:[],
        colors:[
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
        ]
      },
      work:{
        activeTabKey:"myPending",
        tabList: [],
        mySubmit: {
          loading:false,
          dataSource:[],
          columns:[{
            title: "创建时间",
            dataIndex: "creationTime",
            ellipsis: true,
            width: 200
          },{
            title: "表单名称",
            dataIndex: "name",
            ellipsis: true,
            width: 150
          },{
            title: "加急次数",
            dataIndex: "urgentCount",
            ellipsis: true,
            width: 150
          },{
            title: "加急时间",
            dataIndex: "urgentTime",
            ellipsis: true,
            width: 200
          },{
            title: "操作",
            align: "center",
            key: "action",
            ellipsis: true,
            fixed: "right",
            width: 110
          }]
        },
        myPending: {
          loading:false,
          dataSource:[],
          columns:[{
            title: "创建时间",
            dataIndex: "creationTime",
            ellipsis: true,
            width: 200
          },{
            title: "表单名称",
            dataIndex: "name",
            ellipsis: true,
            width: 150
          },{
            title: "申请人",
            dataIndex: "username",
            ellipsis: true,
            width: 150
          },{
            title: "操作",
            align: "center",
            key: "action",
            ellipsis: true,
            fixed: "right",
            width: 110
          }]
        },
        myProcessed:{
          loading:false,
          dataSource:[],
          columns:[{
            title: "创建时间",
            dataIndex: "creationTime",
            ellipsis: true,
            width: 200
          },{
            title: "表单名称",
            dataIndex: "name",
            ellipsis: true,
            width: 150
          },{
            title: "申请人",
            dataIndex: "username",
            ellipsis: true,
            width: 150
          },{
            title: "处理时间",
            dataIndex: "completeTime",
            ellipsis: true,
            width: 150
          },{
            title: "操作",
            align: "center",
            key: "action",
            ellipsis: true,
            fixed: "right",
            width: 110
          }]
        },
        copyMe:{
          loading:false,
          dataSource:[],
          columns:[{
            title: "创建时间",
            dataIndex: "creationTime",
            ellipsis: true,
            width: 200
          },{
            title: "表单名称",
            dataIndex: "name",
            ellipsis: true,
            width: 150
          },{
            title: "申请人",
            dataIndex: "username",
            ellipsis: true,
            width: 150
          },{
            title: "抄送时间",
            dataIndex: "copyTime",
            ellipsis: true,
            width: 150
          },{
            title: "操作",
            align: "center",
            key: "action",
            fixed: "right",
            ellipsis: true,
            width: 110
          }]
        }
      },
      newsOrNotice:{
        loading:false,
        dataSource:[],
        columns:[{
          title: "创建时间",
          dataIndex: "creationTime",
          ellipsis: true,
          width: 120
        },{
          title: "标题",
          dataIndex: "title",
          ellipsis: true,
          width: 350
        },{
          title: "操作",
          align: "center",
          key: "action",
          fixed: "right",
          ellipsis: true,
          width: 110
        }]
      },
      calendarValue:this.$dayjs()
    }
  }
}

</script>