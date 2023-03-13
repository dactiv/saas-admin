<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-organization" /> 机构管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'authentication_department'}"><icon-font class="icon" type="icon-group" /> 部门管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '部门' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '部门'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit"/>
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" :rules="rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="名称:" name="name">
                <a-input ref="name" v-model:value="this.form.name" :disabled="this.form.id !== null" />
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="类型:" name="type">
                <a-select class="width-100-percent" v-model:value="this.form.type">
                  <a-select-option v-for="(value, name) of this.typeOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="上级部门:" name="parentId" v-if="this.form.parentId">
            <a-tree-select :multiple="false" :disabled="!this.form.id" treeDefaultExpandAll :fieldNames="{children:'children', label:'name', value: 'id' }" v-model:value="this.form.parentId" class="width-100-percent" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="this.parentOptions"/>
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

        </a-form>

        <a-divider />

        <a-space>
          <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[department:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>


export default {
  name:"AuthenticationDepartmentEdit",
  inject:['reload'],
  data() {
    return {
      spinning:true,
      typeOptions:[],
      parentOptions:[],
      form: {
        id:null,
        name: "",
        type:10,
        parentId:undefined,
        remark: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入部门名称", trigger: "change" },
          { validator:this.validateRemoteName, trigger: "change" }
        ]
      }
    }
  },
  methods: {

    validateRemoteName() {
      if (this.form.id !== null) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/authentication/department/isNameUnique?name=" + this.form.name).then(r => {
          return r.data.data ? resolve() : reject("部门名称已存在");
        });
      });
    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        this
            .$http
            .post("/api/authentication/department/save", this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);
              this.spinning = false;

              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"authentication_department_edit", query:{id}, replace:true})
                    .then(() => this.reload());
                this.form.id = r.data.data;
              } else {
                this.reload();
              }

            })
            .catch(() => this.spinning = false);
      });
    }
  },
  created() {

    this
        .loadConfigEnumerate({service:"authentication", enumerateName:"DepartmentTypeEnum"})
        .then((r) => this.typeOptions = r.data.data);

    let findParentParam = {
      mergeTree:false
    }

    if (this.$route.query.id !== undefined) {
      this
          .$http
          .get("/api/authentication/department/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.spinning = false;
          })
          .catch(() => this.spinning = false);

      findParentParam["filter_[id_ne]"] = this.$route.query.id;
    } else {
      this.spinning = false;
      if (this.$route.query.parentId) {
        this.form.parentId = this.$route.query.parentId;
      }
    }

    this
        .$http
        .post("/api/authentication/department/find",this.formUrlEncoded(findParentParam))
        .then(r => this.parentOptions = r.data.data);
  }
}
</script>