<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-message" /> 消息管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'message_sms'}"><icon-font class="icon" type="icon-sms" /> 短信消息</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-send" /> 发送站内信</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="发送短信" class="basic-box-shadow margin-lg-top">

      <template #extra>
        <icon-font class="icon" type="icon-sms" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8" :xxl="8">
              <a-form-item label="类型:" name="type">
                <a-select class="width-100-percent" v-model:value="this.form.type">
                  <a-select-option v-for="(name, value) of this.typeOptions" :key="name" :value="name">
                    {{value}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8" :xxl="8">
              <a-form-item label="发送目标类型:">
                <a-select v-model:value="this.send.type" class="width-100-percent" :options="this.send.options" @change="this.send.value = []" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8" :xxl="8">
              <a-form-item label="发送给:" name="phoneNumbers">
                <a-input-group compact>
                  <a-select v-if="this.send.type === 'site'" class="width-100-percent" :filter-option="false" :not-found-content="null" :max-tag-count="5" mode="multiple" v-model:value="this.send.value" label-in-value @select="toUsersSelect" @search="searchUser" @deselect="toUsersDeselect" :options="this.selectOptions" />
                  <a-select v-else mode="tags" class="width-100-percent" :filter-option="false" :not-found-content="null" :max-tag-count="5" v-model:value="this.send.value" />
                </a-input-group>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="内容:" name="content">
            <a-textarea v-model:value="form.content" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

          <a-divider />

          <a-space>
            <a-button type="primary" :loading="this.spinning" @click="submitForm" v-if="principal.hasPermission('perms[message:send]')">
              <icon-font class="icon" v-if="!spinning" type="icon-send" />
              <span class="hidden-xs">发送</span>
            </a-button>
          </a-space>

        </a-form>
      </a-spin>

    </a-card>

  </div>
</template>

<script>

const ALL_USER_OBJECT = {label:'全网师生', value:"ALL_USER"};

export default {
  name:"MessageSmsSend",
  methods:{
    toUsersDeselect(value) {
      if (value.value === ALL_USER_OBJECT.value) {
        this.selectOptions[1].options.forEach(e => e.disabled = false);
        this.selectOptions[2].options.forEach(e => e.disabled = false);
      }
    },
    toUsersSelect(value, options) {

      if (value.value === ALL_USER_OBJECT.value) {
        this.send.value = [ALL_USER_OBJECT];
        this.toUsersDeselect(value);
      } else if (value.value.indexOf("more-") >= 0) {
        this.searchUser(this.selectSearchValue, value.value.replace("more-", ""), true, this.selectOptions[options.selectIndex].number + 1);
        let index = this.send.value.indexOf(value);
        this.send.value.splice(index, 1);
      }

    },
    searchUser(value, type, append, number) {

      let searchFrom = {
        "filter_[username_like]_or_[phone_number_like]_or_[real_name_like]":value,
        "filter_[phone_number_nen]":true,
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
        if (this.send.type === 'phoneNumber') {
          this.form.phoneNumbers = this.send.value;
        } else if (this.send.value.length === 1) {
          let value = this.send.value[0].value;
          if (value === ALL_USER_OBJECT.value) {
            this.form.phoneNumbers = [ALL_USER_OBJECT.value];
          } else {
            this.form.phoneNumbers = this.send.value.filter(v => v.option.phoneNumber).map(v => v.option.phoneNumber);
          }
        }
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
            });
      });
    },
    validatePhoneNumbers() {
      if (this.send.value.length > 0) {
        if (this.send.type === 'phoneNumber') {
          let count = this.send.value.filter(s => !/^1[3|4|5|8][0-9]\d{4,8}$/.test(s));
          if (count.length > 0) {
            return Promise.reject(count.join(",") + ' 的手机号码不正确');
          }
        }
        return Promise.resolve();
      } else {
        if (this.send.type === 'site') {
          return Promise.reject('请选择用户');
        } else {
          return Promise.reject('请输入手机号码');
        }
      }
    }
  },
  created() {
    this.loadConfigEnumerate({service:"admin", enumerateName:"MessageTypeEnum", ignoreValue:[20]}).then(r=> this.typeOptions = r.data.data);
    this.searchUser("");
  },
  data() {
    return {
      selectSearchValue:"",
      spinning: false,
      typeOptions:[],
      send: {
        type:"site",
        value:[],
        options:[{
          label:'站内用户',
          value:'site',
        },{
          label:'手机号码',
          value:'phoneNumber',
        }]
      },
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
      search:{
        dialogVisible:false,
        spinning:false,
        form: {
          "filter_[phone_like]":"",
          "filter_[registration_time_between]":[],
          "filter_[username_like]":"",
          "filter_[status_eq]":"1"
        },
        data:[],
        selectedIds:[],
        columns:[
          {
            title: "注册时间",
            dataIndex: "registrationTime",
            ellipsis: true,
            width: 200,
            slots: { customRender: "registrationTime" }
          },
          {
            title: "登陆账号",
            dataIndex: "username",
            ellipsis: true,
            width: 200
          },
          {
            title: "手机号码",
            dataIndex: "phone",
            ellipsis: true,
            width: 200
          },
          {
            title: "电子邮箱",
            dataIndex: "email",
            ellipsis: true,
            fixed: "right",
            width: 200
          }
        ]
      },
      form: {
        messageType:"sms",
        phoneNumbers:[],
        type:"",
        content:"",
        remark:""
      },
      rules: {
        content: [{ required: true, message: "请输入内容", trigger: "change" }],
        phoneNumbers: [{ required: true, trigger: "change", validator:this.validatePhoneNumbers}],
        type: [{ required: true, message: "请选择类型", trigger: "change" }]
      }
    }
  }
}
</script>