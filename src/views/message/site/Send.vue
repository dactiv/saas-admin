<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_site'}"><icon-font class="icon" type="icon-sms" /> 站内信消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-send" /> 发送站内信</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="发送站内信" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-notification" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" :rules="this.rules" layout="vertical">
          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="类型:" name="type">
                <a-select class="width-100-percent" v-model:value="this.form.type">
                  <a-select-option v-for="(name, value) of this.typeOptions" :key="name" :value="name">
                    {{value}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="发送给:" name="toUsers">
                <a-select class="width-100-percent" :filter-option="false" :not-found-content="null" :max-tag-count="5" mode="multiple" v-model:value="this.form.toUsers" label-in-value @select="toUsersSelect" @search="searchUser" @deselect="toUsersDeselect" :options="this.selectOptions" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="标题:" name="title">
            <a-input v-model:value="form.title" :default-value="form.title" />
          </a-form-item>

          <pre-upload-preview v-model:file-list="this.fileList" />

          <a-form-item label="内容:" name="content" :rules="[{ required: true, validator:this.quillOption.validate, trigger:'change', message:'请输入内容'}]">
            <quill-editor @textChange="this.$refs['edit-form'].validateFields('content')" :toolbar="this.quillOption.modules.toolbar" theme="snow" v-model:content="form.content" content-type="html" />
          </a-form-item>

          <a-col :span="24">
            <a-form-item label="备注:" name="remark">
              <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
            </a-form-item>
          </a-col>

          <a-divider />

          <a-space>

            <a-button type="primary" :loading="spinning" @click="submitForm" v-if="principal.hasPermission('perms[message:send]')">
              <icon-font class="icon" v-if="!spinning" type="icon-send" />
              <span class="hidden-xs hidden-sm hidden-md">发送</span>
            </a-button>

            <a-upload v-if="principal.hasPermission('perms[message:send]')" :showUploadList="false" :multiple="true" v-model:file-list="fileList" :before-upload="beforeUpload">
              <a-button>
                <icon-font class="icon" type="icon-attachment" />
                <span class="hidden-xs hidden-sm hidden-md">上传附件</span>
              </a-button>
            </a-upload>

          </a-space>

        </a-form>
      </a-spin>
    </a-card>
  </div>
</template>

<script>

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import PreUploadPreview from "@/components/file/PreUploadPreview"

const ALL_USER_OBJECT = {label:'全网师生', value:"ALL-0"};

export default {
  name:"MessageSiteSend",
  components:{QuillEditor, PreUploadPreview},
  methods:{
    beforeUpload() {
      return false;
    },
    toUsersDeselect(value) {
      if (value.value === ALL_USER_OBJECT.value) {
        this.selectOptions[1].options.forEach(e => e.disabled = false);
        this.selectOptions[2].options.forEach(e => e.disabled = false);
      }
    },
    toUsersSelect(value, options) {

      if (value.value === ALL_USER_OBJECT.value) {
        this.form.toUsers = [ALL_USER_OBJECT];
        this.toUsersDeselect(value);
      } else if (value.value.indexOf("more-") >= 0) {

        this.searchUser(this.selectSearchValue, value.value.replace("more-", ""), true, this.selectOptions[options.selectIndex].number + 1);
        let index = this.form.toUsers.indexOf(value);
        this.form.toUsers.splice(index, 1);
      }
    },
    searchUser(value, type, append, number) {

      let searchFrom = {
        "filter_[username_like]_or_[phone_number_like]_or_[real_name_like]":value,
        "size":5,
        "number":number || 1
      }
      this.selectSearchValue = value;
      let headers = {};
      headers[process.env.VUE_APP_HEADER_FILTER_RESULT_ID_NAME] = "id_name_inc_view";

      if (!type || type === 'teacher') {
        this
            .$http
            .post("/api/authentication/teacher/page",this.formUrlEncoded(searchFrom),{headers})
            .then(r => {

              let more = this.selectOptions[1].options.find(o => o.value === 'more-teacher');
              if (more) {
                let index = this.selectOptions[1].options.indexOf(more);
                this.selectOptions[1].options.splice(index, 1);
              }

              if (r.data.data.elements) {
                r.data.data.elements.forEach(e => {
                  e.label = e.realName || e.username;
                  e.value = "TEACHER-" + e.id;
                });

                if (append) {
                  this.selectOptions[1].options.push(...r.data.data.elements)
                } else {
                  this.selectOptions[1].options = r.data.data.elements;
                }
              }

              if (!r.data.data.last && !this.selectOptions[1].options.find(o => o.value === 'more-teacher')) {
                this.selectOptions[1].options.push({
                  label:"加载更多...",
                  value:'more-teacher',
                  selectIndex:1
                })
              }
              this.selectOptions[1].number = r.data.data.number;
            });
      }

      if (!type || type === 'student') {
        this
            .$http
            .post("/api/authentication/student/page", this.formUrlEncoded(searchFrom), {headers})
            .then(r => {

              let more = this.selectOptions[2].options.find(o => o.value === 'more-student');
              if (more) {
                let index = this.selectOptions[2].options.indexOf(more);
                this.selectOptions[2].options.splice(index, 1);
              }

              if (r.data.data.elements) {
                r.data.data.elements.forEach(e => {
                  e.label = e.realName || e.username;
                  e.value = "STUDENT-" + e.id + "-";
                });

                if (append) {
                  this.selectOptions[2].options.push(...r.data.data.elements)
                } else {
                  this.selectOptions[2].options = r.data.data.elements;
                }
              }

              if (!r.data.data.last && !this.selectOptions[2].options.find(o => o.value === 'more-student')) {
                this.selectOptions[2].options.push({
                  label: "加载更多...",
                  value: 'more-student',
                  selectIndex:2
                })
              }
              this.selectOptions[2].number = r.data.data.number;
            });
      }
    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {
        this.spinning = true;
        if (this.fileList.length > 0) {
          let promise = this.fileList.map(f => this.uploadFile(f, "message",{prefix:'site'}));
          Promise
              .all(promise)
              .then((values) => {
                values.forEach(v => this.form.attachmentList.push(v.data));
                this.submitFormData();
              })
              .catch(() => this.spinning = false);

        } else {
          this.submitFormData();
        }
        
      });
    },
    submitFormData() {
      this.$refs['edit-form'].validate().then(() => {
        this.fileList = [];
        this.spinning = true;

        if (this.form.pushable === true) {
          this.form.pushable = 1;
        } else {
          this.form.pushable = 0;
        }

        let convertToUsers = [];
        let tempToUsers = this.form.toUsers;
        this.form.toUsers.forEach(u => {
          let typeIdName = {
            name:u.label,
            type:u.value.substring(0, u.value.indexOf("-")),
            id:u.value.substring(u.value.indexOf("-") + 1, u.value.length)
          }
          convertToUsers.push(typeIdName);
        });
        this.form.toUsers = convertToUsers;
        this
            .$http
            .post("/api/message/send", this.form)
            .then((r) => {

              this.spinning = false;
              this.$message.success(r.data.message);

              let to = {};

              if (r.data.data.batchId) {
                to["name"] = "message_batch_detail";
                to["query"] = {id:r.data.data.batchId};
              } else {
                to["name"] = "message_site_detail";
                to["query"] = {id:r.data.data.id[0]};
              }

              this.$router.push(to);

            }).catch(() => {
              this.spinning = false;
              this.form.toUsers = tempToUsers;
            });
      });
    },
    validateToUsers() {
      if (this.form.toUsers.length > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject();
      }
    }
  },
  created() {
    this.loadConfigEnumerate({service:"admin", enumerateName:"MessageTypeEnum"}).then((r) => {
      delete r.data.data["提到我的"];
      this.typeOptions = r.data.data
    });
    this.searchUser("");
  },
  data() {
    return {
      selectSearchValue:"",
      spinning: false,
      fileList:[],
      typeOptions:[],
      selectOptions:[{
        label:'其他',
        key:'other',
        options:[ALL_USER_OBJECT]
      },{
        label:'教师',
        key:'teacher',
        options:[]
      },{
        label:'学生',
        key:'student',
        options:[]
      }],
      form: {
        messageType:"site",
        toUsers:[],
        pushable:0,
        type:"",
        content:"",
        remark:"",
        title:"",
        attachmentList:[]
      },
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "change" }],
        toUsers: [{ required: true, message: "请选择用户", trigger: "change", validator:this.validateToUsers}],
        type: [{ required: true, message: "请选择类型", trigger: "change" }]
      }
    }
  }
}
</script>