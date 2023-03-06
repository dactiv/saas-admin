<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 流程申请管理</a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-file" /> {{this.form.name}}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-spin :spinning="this.spinning">
      <a-card :title="this.form.name" class="basic-box-shadow" >
        <template #extra>
          <icon-font class="icon" type="icon-edit" />
        </template>

        <form-designer v-if="this.form.design.layout.length > 0" ref="form-designer" :design="false" :layout="this.form.design.layout" :form-data="this.applyContent" :config="this.form.design.config" :name="this.form.groupName + '/' + this.form.name" />

        <a-tabs>

          <a-tab-pane key="approve-table">
            <template #tab>
              <icon-font class="icon" type="icon-group" />
              <span class="hidden-xs hidden-sm hidden-md">默认审批人</span>
            </template>

            <a-row justify="start" :gutter="[0,24]">
              <a-col v-for="person of this.form.participantList.filter(p => p.type.value === 10)" :key="person.userId" :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" >
                <a-card :title="person.username" size="small" :style="{width:'110px'}">
                  <template #extra>
                    <a @click="this.confirm('确定删除' + person.username + '审核人吗?',() => removePerson(person))">
                      <a-typography-text type="danger">移除</a-typography-text>
                    </a>
                  </template>
                  <div class="text-center">
                    <a-image :width="64" :height="64" :src="'/api/resources/avatar/get?filename=' + person.userType + '/' + person.userId + '/current&date=' + this.$dayjs().unix()" />
                  </div>
                </a-card>
              </a-col>
              <a-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" >
                <a-card @click="addParticipant(10)" :style="{width:'110px'}" size="small" hoverable class="grey-background border-dashed border-radius text-center" >
                  <a-typography-title :level="1">
                    <icon-font type="icon-add" />
                  </a-typography-title>
                  <p>添加审批人</p>
                </a-card>
              </a-col>
            </a-row>

          </a-tab-pane>

          <a-tab-pane key="copy-table" forceRender>
            <template #tab>
              <icon-font class="icon" type="icon-send" />
              <span class="hidden-xs hidden-sm hidden-md">默认抄送人</span>
            </template>

            <a-row justify="start" :gutter="[0,24]">
              <a-col v-for="person of this.form.participantList.filter(p => p.type.value === 20)" :key="person.userId" :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" >
                <a-card :title="person.username" size="small" :style="{width:'110px'}">
                  <template #extra>
                    <a @click="this.confirm('确定删除' + person.username + '抄送人吗?',() => removePerson(person))">
                      <a-typography-text type="danger">移除</a-typography-text>
                    </a>
                  </template>
                  <div class="text-center">
                    <a-image :width="64" :height="64" :src="'/api/resources/avatar/get?filename=' + person.userType + '/' + person.userId + '/current&date=' + this.$dayjs().unix()" />
                  </div>
                </a-card>
              </a-col>
              <a-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" >
                <a-card @click="addParticipant(20)" :style="{width:'110px'}" size="small" hoverable class="grey-background border-dashed border-radius text-center" >
                  <a-typography-title :level="1">
                    <icon-font type="icon-add" />
                  </a-typography-title>
                  <p>添加抄送人</p>
                </a-card>
              </a-col>
            </a-row>
          </a-tab-pane>

        </a-tabs>

        <a-divider />

        <a-space>
          <a-button type="primary" @click="submitForm(true)" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">提交</span>
          </a-button>
          <a-button @click="submitForm(false)" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-save" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
        </a-space>

      </a-card>
    </a-spin>
    <a-modal v-model:visible="this.department.dialogVisible" width="800px" title="审核参与者信息" @ok="selectedPerson()" layout="vertical">
      <department-table ref="department-table" :scroll="{x:715, y:300}" :checkbox-props="getCheckboxProps" :searchData="{mergeTree:true, loadUser:true}" :created-search="true" v-model:selected-ids="this.department.selectedPersonIds"/>
    </a-modal>
  </div>
</template>

<script>

import FormDesigner from '@/components/form-designer/FormDesigner'
import DepartmentTable from "@/components/authentication/DepartmentTable";

export default {
  name: "WorkflowFormApply",
  components:{FormDesigner, DepartmentTable},
  methods:{
    addParticipant(type) {
      this.department.type = type;
      this.department.dialogVisible = true;
      this.department.selectedPersonIds = this
          .form
          .participantList
          .filter(p => p.type.value === this.department.type)
          .map(p => "person-" + p.userId)
          .sort((a,b) => a.sort - b.sort);
    },
    removePerson(person) {
      let index = this.form.participantList.indexOf(person);
      this.form.participantList.splice(index, 1);
    },
    selectedPerson() {

      let typePerson = this.form.participantList.filter(p => p.type.value === this.department.type);

      typePerson.forEach(p => this.removePerson(p));

      let personRecords = this.$refs["department-table"].getSelectedPersonRecords();
      for (let i = 0; i < personRecords.length; i++ ) {
        let r = personRecords[i];
        let person = {
          userId:r.userId,
          username:r.username,
          userType:r.userType,
          sort:i,
          type: {
            value:this.department.type
          }
        }
        this.form.participantList.push(person);
      }
      this.department.dialogVisible = false;
    },
    getCheckboxProps(r) {
      return {disabled:r.recordType === 'department'}
    },
    submitForm(isPublish) {
      this.$refs["form-designer"].submitForm().then((r) =>{
        let data = {};
        data.formId = this.form.id;
        data.formName = this.form.name;
        data.approvalType = this.form.approvalType;
        data.applyContent = r;
        data.formContent = this.form.design;
        data.participantList = this.form.participantList;
        this.spinning = true;
        this
            .$http
            .post("/api/workflow/apply/save?isPublish=" + isPublish,data)
            .then((r) => {
              this.$message.success(r.data.message);
              if (isPublish) {
                this.$router.push({name:"workflow_work_my_submit"});
              } else {
                this.$router.push({name:"workflow_work_my_create"});
              }
            })
            .catch(() => this.spinning = false);
      });
    },
    getApplyContent(id) {
      this
          .$http
          .get("/api/workflow/apply/get?id=" + id)
          .then((r) => {
            this.applyContent = r.data.data.applyContent
            this.applyContent.id = r.data.data.id;
          });
    }
  },
  created() {
    if (!this.$route.query.formId) {
      this.$router.push({name:"400"});
    }
    this.spinning = true;
    this
        .$http
        .get("/api/workflow/form/get?id=" + this.$route.query.formId)
        .then((r) => {
          this.form = r.data.data;

          if (this.$route.query.applyId) {
            // FIXME 该方法会导致 vue 触发一个警告
            this.getApplyContent(this.$route.query.applyId);
          }
          this.spinning = false;
        }).catch(() => this.spinning = false);
  },
  data() {
    return {
      department:{
        type:10,
        selectedPersonIds:[],
        dialogVisible:false
      },
      spinning:false,
      applyContent:{},
      form: {
        name:"",
        design:{
          config:undefined,
          layout:[]
        },
        participantList:[]
      }
    }
  }
}
</script>