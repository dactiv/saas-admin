<template>

  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-survey" /> 审批管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'workflow_form'}"> <icon-font class="icon" type="icon-form" /> 流程表单管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '流程表单' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '流程表单'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-steps :current="this.steps" class="margin-lg-bottom">
          <a-step title="编辑表单信息">
            <template #icon>
              <icon-font type="icon-edit" />
            </template>
          </a-step>
          <a-step title="制作表单">
            <template #icon>
              <icon-font type="icon-form" />
            </template>
          </a-step>
        </a-steps>

        <a-form v-if="this.steps === 1" ref="edit-form" :model="this.form" :rules="rules" layout="vertical">
          <div class="text-center margin-lg-bottom">
            <a-avatar :size="64" shape="square" :src="this.form.icon" />
            <p class="margin-md-top">
              <a-upload :showUploadList="false" :action="'/api/resources/avatar/upload/TEACHER/' + this.form.id" :max-count="1" @change="iconFileChange" :before-upload="iconBeforeUpload">
                <a-button size="small">
                  <icon-font class="icon" type="icon-caps-lock" />
                  <span class="hidden-xs hidden-sm hidden-md">上传图标</span>
                </a-button>
              </a-upload>
            </p>
          </div>
          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="名称:" name="name">
                <a-input v-model:value="this.form.name"/>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="所属组:" name="groupId">
                <a-select v-model:value="this.form.groupId" class="width-100-percent" @change="this.form.groupName = this.groupOptions.find(o => o.id === this.form.groupId).name">
                  <a-select-option v-for="o of this.groupOptions" :key="o.id" :value="o.id">
                    {{o.name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="审批方式:" name="approvalType">
                <a-select v-model:value="this.form.approvalType" class="width-100-percent" >
                  <a-select-option v-for="(value, name) of this.approvalTypeOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item name="applyDepartment">
                <template #label>
                  <a-space>
                    可发起的部门:
                    <a-tooltip>
                      <template #title>不设置即所有部门和所有人员都可发起该流程申请。</template>
                      <a-typography-text type="secondary">
                        <icon-font class="icon" type="icon-help" />
                      </a-typography-text>
                    </a-tooltip>
                  </a-space>
                </template>
                <a-tree-select @change="this.onTreeSelectChange" :maxTagCount="3" :allowClear="true" :treeCheckStrictly="true" :treeCheckable="true" :treeDefaultExpandAll="true" :fieldNames="{children:'children', label:'name', value: 'id' }" v-model:value="this.form.applyDepartment" tree-data-simple-mode class="width-100-percent" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="this.departmentDataSource"/>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="24">
              <a-form-item label="备注:" name="remark">
                <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
              </a-form-item>
            </a-col>

          </a-row>

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
                      <a @click="this.confirm('确定移除' + person.username + '审核人吗?',() => removePerson(person))">
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
                      <a @click="this.confirm('确定移除' + person.username + '抄送人吗?',() => removePerson(person))">
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
        </a-form>

        <form-designer v-if="this.steps === 2" ref="form-designer" v-model:layout="this.form.design.layout" :config="this.form.design.config" :name="this.form.groupName + '/' + this.form.name" />

        <a-divider />

        <a-space>
          <a-button @click="this.steps--" :disabled="this.steps === 1" >
            <icon-font class="icon" v-if="!spinning" type="icon-arrow-left-bold" />
            <span class="hidden-xs hidden-sm hidden-md">上一步</span>
          </a-button>
          <a-button @click="designer()" v-if="this.steps < 2 && this.principal.hasPermission('perms[form:save]')" >
            <icon-font class="icon" v-if="!spinning" type="icon-arrow-right-bold" />
            <span class="hidden-xs hidden-sm hidden-md">下一步</span>
          </a-button>
          <a-button type="primary" @click="submitForm" v-if="this.steps  === 2 && this.principal.hasPermission('perms[form:save]')" :loading="spinning" >
            <icon-font class="icon" v-if="!spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>

    <a-modal v-model:visible="this.department.dialogVisible" width="800px" title="参与者信息" @ok="selectedPerson()" layout="vertical">
      <department-table ref="department-table" :scroll="{x:715, y:300}" :checkbox-props="getCheckboxProps" :searchData="{mergeTree:true, loadUser:true}" :created-search="true" v-model:selected-ids="this.department.selectedPersonIds"/>
    </a-modal>
  </div>

</template>

<script>

import FormDesigner from '@/components/form-designer/FormDesigner'
import DepartmentTable from "@/components/authentication/DepartmentTable";

export default {
  name:"WorkflowFormEdit",
  components:{FormDesigner, DepartmentTable},
  inject:['reload'],
  data() {
    return {
      department:{
        type:10,
        dialogVisible:false,
        selectedPersonIds:[]
      },
      steps:1,
      groupOptions:[],
      applyDepartment:[],
      departmentDataSource:[],
      approvalTypeOptions:[],
      spinning:false,
      form:{
        icon:"",
        name:"",
        groupId:null,
        approvalType:null,
        applyDepartment:undefined,
        remark:"",
        participantList:[],
        design:{
          config:{
            colon:true,
            hideRequiredMark:false,
            labelWrap:false,
            layout:'horizontal',
            noStyle:false,
            scrollToFirstError:false,
            validateOnRuleChange:true
          },
          layout:[],
        }
      },
      rules: {
        name: [{ required: true, message: "请输入表单名称", trigger: "change"}],
        approvalType: [{ required: true, message: "请选输入审批方式", trigger: "change" }],
        groupId:[{ required: true, message: "请选择所属组", trigger: "change" }],
      }
    }
  },
  methods: {
    onTreeSelectChange(value) {
      this.applyDepartment = value.map(v => {
        return {id:v.value, name:v.label}
      });
    },
    addParticipant(type) {
      this.department.type = type;
      this.department.dialogVisible = true;
      this.department.selectedPersonIds = this
          .form
          .participantList.filter(p => p.type.value === this.department.type)
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
    iconFileChange(info) {
      if (info.file.status === "done") {
        this.form.icon = info.file.response.data.link + "&date=" + this.$dayjs().unix();
      }
    },
    iconBeforeUpload(file) {
      let isTypeValid = file.type === 'image/jpeg' || file.type === 'image/png';

      if (!isTypeValid) {
        this.$message.error("仅支持上传 jpeg 或 png 的图片");
      }

      let isSizeValid = file.size / 1024 / 1024 < 1;

      if (!isSizeValid) {
        this.$message.error('图片必须小于 1MB!');
      }

      return isTypeValid && isSizeValid;
    },
    designer() {
      this.$refs['edit-form'].validate().then(() => {
        this.steps++;
      });
    },
    submitForm() {
      this.spinning = true;
      this.form.applyDepartment = this.applyDepartment;
      this
          .$http
          .post("/api/workflow/form/save",this.form)
          .then((r) => {
            let id = r.data.data;
            this.$message.success(r.data.message);
            this.form.id = r.data.data;

            if (id !== this.form.id) {
              this
                  .$router
                  .push({name:"workflow_form_edit", query:{id}, replace:true})
                  .then(() => this.reload());
            } else {
              this.reload();
            }

            this.spinning = false;
          })
          .catch(() => this.spinning = false);

    }
  },
  created() {

    this
        .loadConfigEnumerate({service:"admin", enumerateName:"FormApprovalTypeEnum"})
        .then((r) => this.approvalTypeOptions = r.data.data);

    this.$http.post("/api/workflow/group/find").then((r) => this.groupOptions = r.data.data);
    this.$http.post("/api/authentication/department/find?mergeTree=true").then((r) => this.departmentDataSource = r.data.data);

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/api/workflow/form/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.applyDepartment = this.form.applyDepartment;
            this.form.applyDepartment = this.form.applyDepartment.map(r => {
              return {
                value: r.id,
                label: r.name
              }
            });
            this.spinning = false;
          })
          .catch(() => this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>