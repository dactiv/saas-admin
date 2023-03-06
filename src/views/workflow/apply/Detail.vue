<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item v-if="this.$route.query.from === 'workflow_apply'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-file-add" /> 流程申请管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item v-else-if="this.$route.query.from === 'workbench'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-workbench" /> 工作台</router-link></a-breadcrumb-item>
      <a-breadcrumb-item v-else-if="this.$route.query.from === 'workflow_work_my_create'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-form" /> 我创建的</router-link></a-breadcrumb-item>
      <a-breadcrumb-item v-else-if="this.$route.query.from === 'workflow_work_my_submit'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-complete" /> 我提交的</router-link></a-breadcrumb-item>
      <a-breadcrumb-item v-else-if="this.$route.query.from === 'workflow_work_my_pending'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-more" /> 我的代办</router-link></a-breadcrumb-item>
      <a-breadcrumb-item v-else-if="this.$route.query.from === 'workflow_work_my_processed'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-enum-major-o" /> 我的经办</router-link></a-breadcrumb-item>
      <a-breadcrumb-item v-else-if="this.$route.query.from === 'workflow_work_copy_me'"><router-link :to="{name:this.$route.query.from}"><icon-font class="icon" type="icon-share" /> 抄送我的</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> {{this.apply.formName}}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="this.apply.formName" class="basic-box-shadow" >
      <a-spin :spinning="this.spinning">
        <template #extra>
          <icon-font class="icon" type="icon-file" />
        </template>
        <a-divider orientation="left">申请信息</a-divider>
        <a-descriptions bordered layout="vertical" :column="{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }">
          <a-descriptions-item label="申请人">
            <a-space>
              <a-avatar :src="'/api/resources/avatar/get?filename=' + this.apply.userType + '/' + this.apply.userId + '/current&date=' + this.$dayjs().unix()" />
              {{this.apply.username}}
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ this.timestampFormat(this.apply.creationTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="加急次数">
            {{ this.apply.urgentCount }} 次
          </a-descriptions-item>
          <a-descriptions-item label="加急时间">
            {{ this.timestampFormat(this.apply.urgentTime) || '无'}}
          </a-descriptions-item>
          <a-descriptions-item label="当前状态">
            {{ this.apply.status.name}}
          </a-descriptions-item>
          <a-descriptions-item label="完成时间">
            {{ this.timestampFormat(this.apply.completionTime) }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider orientation="left">表单信息</a-divider>
        <form-designer v-if="this.apply.formContent && this.apply.formType === 10" ref="form-designer" :form-data="this.apply.applyContent" pattern="readPretty" :design="false" :layout="this.apply.formContent.layout" :config="this.apply.formContent.config" :name="this.apply.formName" />
        <curriculum-detail v-if="this.apply.formType === 20" :id="this.apply.formId" :read-status="['read','audit']"/>
        <class-hour-content-detail v-if="this.apply.formType === 30" :id="this.apply.formId" />
        <examination-detail v-if="this.apply.formType === 40" :id="this.apply.formId" />
        <objective-question-detail v-if="this.apply.formType === 50" :id="this.apply.formId" />
        <subjective-question-detail v-if="this.apply.formType === 60" :id="this.apply.formId" />

        <template v-if="this.apply.status.value !== 10">
          <a-divider orientation="left"><a-space>审批信息 <a-tag>{{this.apply.approvalType.name}}</a-tag></a-space></a-divider>

          <a-timeline class="padding-lg-top" >
            <a-timeline-item v-for="person of this.apply.approvalList" :key="person.id" :color="this.timelineColor[person.status.value.toString()]">
              <template #dot>
                <a-avatar size="small" :src="'/api/resources/avatar/get?filename=' + person.userType + '/' + person.userId + '/current&date=' + this.$dayjs().unix()" />
              </template>
              <a-space>
                <a-typography-text type="success" v-if="person.userId === this.principal.details.id && person.userType === this.principal.details.type">
                  我
                </a-typography-text>
                <a-typography-text v-else>
                  {{ person.username }}
                </a-typography-text>
                <a-typography-text type="secondary" v-if="person.operationTime">在 {{this.timestampFormat(person.operationTime)}}</a-typography-text>
                <a-typography-text type="secondary">{{person.status.name}}</a-typography-text>
                <a-typography-text strong v-if="person.result">结果为:{{person.result.name}}</a-typography-text>
                <a-typography-text disabled v-if="person.remark">备注为:{{person.remark}}</a-typography-text>
              </a-space>
            </a-timeline-item>

            <template v-if="this.apply.copyList">
              <a-timeline-item v-for="person of this.apply.copyList" :key="person.id" :color="this.timelineColor[person.status.value.toString()]">
                <template #dot>
                  <a-avatar size="small" :src="'/api/resources/avatar/get?filename=' + person.userType + '/' + person.userId + '/current&date=' + this.$dayjs().unix()" />
                </template>
                <a-space>
                  <a-typography-text type="success" v-if="person.userId === this.principal.details.id && person.userType === this.principal.details.type">
                    我
                  </a-typography-text>
                  <a-typography-text v-else>
                    {{ person.username }}
                  </a-typography-text>
                  <a-typography-text type="secondary" v-if="person.copyTime"> {{this.timestampFormat(person.copyTime)}}</a-typography-text>
                  <a-typography-text type="secondary">{{person.status.name}}</a-typography-text>
                </a-space>
              </a-timeline-item>
            </template>
          </a-timeline>
        </template>

        <template v-if="this.getApprovalRecord()">

          <a-form v-if="this.apply.formContent" :layout="this.apply.formType === 10 ? this.apply.formContent.config.layout : 'vertical'">
            <a-form-item label="审批备注:" name="remark">
              <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
            </a-form-item>
          </a-form>

          <a-divider />

          <a-space>
            <a-button type="primary" :loading="this.spinning" @click="processing(10)">
              <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
              <span class="hidden-xs hidden-sm hidden-md">同意</span>
            </a-button>
            <a-button type="primary" danger :loading="this.spinning"  @click="processing(20)">
              <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
              <span class="hidden-xs hidden-sm hidden-md">拒绝</span>
            </a-button>
            <a-button @click="nextApply()" v-if="this.getNextApplyId() > 0">
              <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
              <span class="hidden-xs hidden-sm hidden-md">下一个</span>
            </a-button>
          </a-space>
        </template>
      </a-spin>
    </a-card>
  </div>
</template>

<script>

import FormDesigner from '@/components/form-designer/FormDesigner'

import CurriculumDetail from '@/components/resources/curriculum/Detail'
import ClassHourContentDetail from '@/components/resources/curriculum/chapter/ClassHourContentDetail'
import ExaminationDetail from '@/components/resources/curriculum/examination/ExaminationDetail'
import ObjectiveQuestionDetail from '@/components/resources/curriculum/question/ObjectiveQuestionDetail'
import SubjectiveQuestionDetail from '@/components/resources/curriculum/question/SubjectiveQuestionDetail'

export default {
  name: "WorkflowApplyDetail",
  components:{FormDesigner, CurriculumDetail, ClassHourContentDetail, ExaminationDetail, ObjectiveQuestionDetail, SubjectiveQuestionDetail},
  created() {

    if (!this.$route.query.id) {
      this.$router.push({name:"400"});
    }

    this.loadByParams();
  },
  watch: {
    '$route': function() {
      if (!this.$route.query.id) {
        return ;
      }

      this.loadByParams();
    }
  },
  methods:{
    loadByParams() {
      this.applyIds = JSON.parse(this.$route.query.id);
      if (!(this.applyIds instanceof Array)) {
        this.applyIds = [this.applyIds];
      }
      this.getApply(this.applyIds[0]);
    },
    nextApply() {
      let nextId = this.getNextApplyId();

      if (nextId > 0) {
        this.getApply(nextId);
      }
    },
    getNextApplyId() {
      let index = this.applyIds.indexOf(this.currentId);
      if (index === this.applyIds.length - 1) {
        return -1;
      }

      return this.applyIds[index + 1];
    },
    getApprovalRecord() {
      return this.apply.approvalList.find(a => a.status.value === 20 && a.userId === this.principal.details.id && a.userType === this.principal.details.type);
    },
    processing(result) {
      this.spinning = true;
      this
          .$http
          .post("/api/workflow/apply/approval", this.formUrlEncoded({id:this.currentId, result:result}))
          .then((r) => {
            this.$message.success(r.data.message);
            let index = this.applyIds.indexOf(this.currentId);
            this.applyIds.splice(index, 1);
            if (this.applyIds.length > 0) {
              sessionStorage.setItem(process.env.VUE_APP_SESSION_STORAGE_WORK_APPROVAL, this.applyIds);
              this.nextApply();
            } else {
              sessionStorage.removeItem(process.env.VUE_APP_SESSION_STORAGE_WORK_APPROVAL);
              this.$router.push({name: "workflow_work_my_pending"});
            }
            this.spinning = false;
          }).catch(() => this.spinning = false);
    },
    getApply(id) {
      this.spinning = true;
      this
          .$http
          .get("/api/workflow/apply/get?id=" + id)
          .then((r) => {
            this.currentId = id;
            r.data.data.formType = r.data.data.formType.value;
            this.apply = r.data.data;
            this.spinning = false;
          }).catch(() => this.spinning = false);
    }
  },
  data() {
    return {
      timelineColor:{
        "10":'blue',
        "20":'purple',
        "30":'green',
        "40":''
      },
      spinning:false,
      applyIds:[],
      currentId:-1,
      form:{
        remark:""
      },
      apply:{
        userId:undefined,
        username:"加载中.",
        userType:"",
        formId:undefined,
        formName:"加载中.",
        applyContent:undefined,
        formContent:undefined,
        approvalList:[],
        approvalType: {
          name:"加载中.."
        },
        status: {
          name:"加载中.."
        },
        urgentCount:0,
        urgentTime:undefined,
        completionTime:undefined
      }
    }
  }
}

</script>