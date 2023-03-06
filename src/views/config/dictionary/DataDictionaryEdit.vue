<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'config_dictionary'}"> <icon-font class="icon" type="icon-dictionary" /> 数据字典管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'config_dictionary_type_edit', query:{id:typeEntity.id}}"><icon-font class="icon" type="icon-category" /> {{ '编辑 [' + typeEntity.name + '] ' + '字典类型' }}</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '数据字典' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '数据字典'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" :rules="rules" layout="vertical">

          <a-row :gutter="[24]">

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="名称:" name="name">
                <a-input v-model:value="this.form.name" @change="nameChange"/>
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="代码:" name="code">
                <a-input ref="code" :addon-before="this.parentCode" v-model:value="this.form.code"></a-input>
              </a-form-item>
            </a-col>

          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="状态:" name="enabled">
                <a-select class="width-100-percent" v-model:value="this.form.enabled">
                  <a-select-option v-for="(value, name) of this.statusOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item show-search label="等级:" name="level">
                <a-input v-model:value="this.form.level" />
              </a-form-item>
            </a-col>

          </a-row>

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12" v-if="this.form.parentId">
              <a-form-item label="上级:" name="parentId">
                <a-select class="width-100-percent" :disabled="!this.form.id" v-model:value="this.form.parentId">
                  <a-select-option v-for="p of this.parentOptions" :key="p.name" :value="p.id" @change="parentChange" optionFilterProp="key">
                    {{p.name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="!this.form.parentId ? 24 : 12" :xl="!this.form.parentId ? 24 : 12" :xxl="!this.form.parentId ? 24 : 12">
              <a-form-item label="值类型:" name="valueType">
                <a-select class="width-100-percent" v-model:value="this.form.valueType">
                  <a-select-option v-for="(value, name) of this.valueOptions" :key="value" :value="value">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="值:" name="value">
            <a-textarea v-model:value="this.form.value" :auto-size="{ minRows: 5, maxRows: 5 }"/>
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

        </a-form>

        <a-divider />

        <a-space>
          <a-button type="primary" @click="submitForm" v-if="principal.hasPermission('perms[data_dictionary:save]')" :loading="spinning" >
            <icon-font class="icon" v-if="!spinning" type="icon-select" />
            <span class="hidden-xs">保存</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"AdminDataDictionaryEdit",
  data() {
    return {
      spinning:true,
      parentOptions:[],
      statusOptions:[],
      valueOptions:[],
      parentCode:"",
      typeEntity: {
        code:"",
        id:undefined
      },
      form: {
        id: null,
        code: "",
        name: "",
        enabled:"1",
        value: "",
        typeId: "",
        level: "",
        remark: "",
        parentId: ""
      },
      rules: {
        code: [
          { required: true, message: "请输入代码", trigger: "change" },
          { validator:this.validateRemoteCode, trigger: "change"}
        ],
        value: [{ required: true, message: "请输入值", trigger: "blur" }],
        name: [{ required: true, message: "请输入名称", trigger: "change" }]
      }
    }
  },
  methods: {
    nameChange() {
      if (this.form.id === null) {
        this.form.code = this.$pinyin(this.form.name,{ toneType: 'none' }).replace(/\s+/g,"");
      }
    },
    validateRemoteCode() {
      if (this.form.id !== null) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        this.$http.get("/api/admin/dictionary/isDataDictionaryCodeUnique?code=" + this.parentCode + this.form.code).then(r => {
          return r.data.data ? resolve() : reject("类型代码已存在");
        });
      });
    },
    parentChange(v) {

      let code = "";

      if (v !== "") {
        let parent = this.parentOptions.find(o => o.id === v * 1);
        code = this.typeEntity.code + "." + parent.code.replace(this.typeEntity.code, "") + ".";
      } else {
        code = this.typeEntity.code + ".";
      }

      this.parentCode = code;

    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        this
            .$http
            .post("/api/admin/dictionary/saveDataDictionary",this.form)
            .then((r) => {
              let id = r.data.data;

              this.$message.success(r.data.message);

              if (id !== this.form.id) {
                this.$router.push({name:"config_data_dictionary_edit", query:{id:id,typeId:this.typeEntity}, replace:true}).then(() => this.reload());
                this.form.id = r.data.data;
              }

              this.spinning = false;

            })
            .catch(() => this.spinning = false);

      });
    }
  },
  watch: {
    parentCode() {
      this.form.code = this.form.code.replace(this.parentCode, "");
    }
  },
  created() {

    this.form.typeId = this.$route.query.typeId;

    let findParentParam = {
      "mergeTree":false,
      "filter_[type_id_eq]":this.form.typeId
    };

    this.loadConfigEnumerates({admin:[{id:"DisabledOrEnabled"}, {id:"ValueTypeEnum"}]}).then((r) => {
      this.statusOptions = r.data.data.admin.DisabledOrEnabled;
      this.valueOptions = r.data.data.admin.ValueTypeEnum;
    });

    if (this.$route.query.id !== undefined) {
      findParentParam["filter_[id_ne]"] = this.$route.query.id;
    } else {
      this.spinning = false
    }

    this
        .$http
        .get("/api/admin/dictionary/getDictionaryType?id=" + this.form.typeId)
        .then(r => {

          this.typeEntity = r.data.data;
          this.parentCode = this.typeEntity.code + ".";

          this
              .$http
              .post("/api/admin/dictionary/findDataDictionary",this.formUrlEncoded(findParentParam))
              .then(r => {

                this.parentOptions = r.data.data;

                if (this.$route.query.id !== undefined) {

                  this
                      .$http
                      .get("/api/admin/dictionary/getDataDictionary?id=" + this.$route.query.id)
                      .then(r => {

                        this.form = r.data.data;
                        this.form.code = this.form.code.replace(this.parentCode, "");
                        this.spinning = false;

                        this.parentChange(this.form.parentId);

                      })
                      .catch(() => this.spinning = false);

                } else {
                  this.spinning = false;
                  if (this.$route.query.parentId) {
                    this.form.parentId = this.$route.query.parentId * 1;
                    this.parentChange(this.form.parentId);
                  }
                }

              });
        });
  }
}
</script>