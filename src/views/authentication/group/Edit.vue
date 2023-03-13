<template>
  <div>
    <a-breadcrumb class="hidden-xs hidden-sm hidden-md">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-authority" /> 权限管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'authentication_group'}"><icon-font class="icon" type="icon-group" /> 角色管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '角色' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '角色'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit"/>
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" :rules="this.rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="组名称:" name="name">
                <a-input ref="name" v-model:value="this.form.name" @change="nameChange" :disabled="this.form.id !== null" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="权限名:" name="authority">
                <a-input ref="authority" v-model:value="this.form.authority" :disabled="this.form.id !== null" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="是否可删除:" name="removable">
                <a-select class="width-100-percent" v-model:value="this.form.removable">
                  <a-select-option v-for="(value, name) of this.yesOrNoOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="是否可编辑:" name="modifiable">
                <a-select class="width-100-percent" v-model:value="this.form.modifiable">
                  <a-select-option v-for="(value, name) of this.yesOrNoOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="来源:" name="sources">
                <a-select @change="sourcesChange" class="width-100-percent" mode="multiple" v-model:value="this.form.sources" >
                  <a-select-option v-for="(value,name) of this.sourceOptions" :key="name" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12" >

              <a-form-item label="状态:" name="status">
                <a-select class="width-100-percent" v-model:value="this.form.status">
                  <a-select-option v-for="(value, name) of this.statusOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

          </a-row>


          <a-form-item label="上级组:" name="parentId" v-if="this.form.parentId">
            <a-tree-select :multiple="false" :disabled="!this.form.id" treeDefaultExpandAll :fieldNames="{children:'children', label:'name', value: 'id' }" v-model:value="this.form.parentId" class="width-100-percent" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="this.parentOptions"/>
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

          <a-divider orientation="left"><icon-font type="icon-authority" /> 拥有权限</a-divider>
          <resource-table ref="resource-table" :selection="true" v-model:selected-ids="this.selectedResourceIds"/>

        </a-form>

        <a-divider />

        <a-space>
          <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[group:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs hidden-sm hidden-md">保存</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

import ResourceTable from "@/components/authentication/ResourceTable";

export default {
  name:"AuthenticationGroupEdit",
  components:{ResourceTable},
  inject:['reload'],
  data() {
    return {
      spinning:true,
      statusOptions:[],
      parentOptions:[],
      sourceOptions:[],
      yesOrNoOptions:[],
      selectedResourceIds:[],
      form: {
        id:null,
        name: "",
        authority: "",
        sources: [],
        resourceMap:{},
        parentId:"",
        removable: 1,
        modifiable: 1,
        status: 1,
        remark: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入组名称", trigger: "change" },
          { validator:this.validateRemoteName, trigger: "change" }
        ],
        authority: [
          { required: true, message: "请输入权限名称", trigger: "change" },
          { validator:this.validateRemoteAuthority, trigger: "change" }
        ],
        sources: [{ required: true, message: "请选择组来源", trigger: "change", type: "array" }]
      }
    }
  },
  methods: {
    nameChange() {
      if (this.form.id === null) {
        this.form.authority = this.$pinyin(this.form.name,{ toneType: 'none' }).replace(/\s+/g,"");
      }
    },
    sourcesChange(value) {
      if(value.length === 0) {
        this.$refs['resource-table'].data = [];
      } else {
        this.$refs['resource-table'].search({"mergeTree":true, "sources":value});
      }
    },
    validateRemoteName() {
      if (this.form.id !== null) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/authentication/group/isNameUnique?name=" + this.form.name).then(r => {
          return r.data.data ? resolve() : reject("组名称已存在");
        });
      });
    },
    validateRemoteAuthority() {
      if (this.form.id !== null) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/authentication/group/isAuthorityUnique?authority=" + this.form.authority).then(r => {
          return r.data.data ? resolve() : reject("权限名称已存在");
        });
      });
    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        let resources = this.$refs['resource-table'].getSelectedRecords();

        if (resources.length > 0) {
          let resourceMap = {};
          resources.forEach(r => {
            if (!resourceMap[r.applicationName]) {
              resourceMap[r.applicationName] = [];
            }
            resourceMap[r.applicationName].push(r.id);
          })
          this.form.resourceMap = resourceMap;
        } else {
          this.form.resourceMap = {};
        }

        this
            .$http
            .post("/api/authentication/group/save", this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);

              this.spinning = false;

              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"authentication_group_edit", query:{id}, replace:true})
                    .then(() => this.reload());
              } else {
                this.reload();
              }

            })
            .catch(() => this.spinning = false);
      });
    }
  },
  created() {

    this.loadConfigEnumerates({config:[{id:"DisabledOrEnabled"}, {id:"ResourceSourceEnum"}, {id:"YesOrNo"}]}).then((r) => {
      this.statusOptions = r.data.data.config.DisabledOrEnabled;
      this.sourceOptions = r.data.data.config.ResourceSourceEnum;
      this.yesOrNoOptions = r.data.data.config.YesOrNo;
    });

    let findParentParam = {
      mergeTree:false
    }

    if (this.$route.query.id !== undefined) {
      this
          .$http
          .get("/api/authentication/group/get?id=" + this.$route.query.id)
          .then(r => {
            this.form = r.data.data;
            this.form.sources =  r.data.data.sources.map(s => s.value);
            this.removable = r.data.data.removable.value;
            this.modifiable  = r.data.data.modifiable.value;
            this.spinning = false;

            if (this.form.resourceMap) {
              for (let key in this.form.resourceMap) {
                this.selectedResourceIds.push(...this.form.resourceMap[key]);
              }
            }

            if (this.form.sources.length > 0) {
              this.$refs['resource-table'].search({mergeTree:true, sources:this.form.sources});
            }

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
        .post("/api/authentication/group/find",this.formUrlEncoded(findParentParam))
        .then(r => this.parentOptions = r.data.data);
  }
}
</script>