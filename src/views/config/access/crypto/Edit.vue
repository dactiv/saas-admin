<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-un-config-o" /> 配置管理</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'config_access_crypto'}"> <icon-font class="icon" type="icon-crypto-currency-bitcoin-imac"/> 访问加解密管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (form.id ? '编辑 [' + form.name + '] ': '添加') + '访问加解密' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(form.id ? '编辑 [' + form.name + '] ': '添加') + '访问加解密'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="spinning">
        <a-form ref="edit-form" :model="form" :rules="rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :span="12">
              <a-form-item has-feedback label="名称:" name="name">
                <a-input v-model:value="form.name" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item has-feedback label="拦截值:" name="value">
                <a-input v-model:value="form.value" />
              </a-form-item>
            </a-col>
          </a-row>


          <a-row :gutter="[24]">

            <a-col :span="12">
              <a-form-item has-feedback label="类型:" name="type">
                <a-input v-model:value="form.type" />
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item label="状态:" name="enabled">
                <a-select class="width-100-percent" v-model:value="form.enabled">
                  <a-select-option v-for="(value, name) of statusOptions" :key="value + ''" :value="value + ''">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

          </a-row>

          <a-row :gutter="[24]">
            <a-col :span="12">
              <a-form-item label="是否请求解密:" name="requestDecrypt">
                <a-select class="width-100-percent" v-model:value="form.requestDecrypt">
                  <a-select-option v-for="(value, name) of yesOrNoOptions" :key="value + ''" :value="value + ''">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="12">
              <a-form-item show-search label="是否响应解密:" name="responseEncrypt">
                <a-select class="width-100-percent" v-model:value="form.responseEncrypt">
                  <a-select-option v-for="(value, name) of yesOrNoOptions" :key="value + ''" :value="value + ''">
                    {{name}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

          </a-row>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="form.remark" :auto-size="{ minRows: 2, maxRows: 5 }"/>
          </a-form-item>

          <a-table class="ant-table-striped" :row-selection="{ selectedRowKeys: predicate.selectedIds, onChange: selectPredicateChange}" :rowKey="record=>record.id" :scroll="{ x: 835 }" :pagination="false" :data-source="this.form.predicates" :columns="predicate.columns" bordered>

            <template #title>
              <a-row>
                <a-col :span="8" class="text-line-height-32">
                  <icon-font class="icon" type="icon-un-config-o" /> 断言条件
                </a-col>
                <a-col :span="8" :offset="8" class="text-right">
                  <a-space :size="10">
                    <a-button @click="editPredicate(null)" v-if="principal.hasPermission('perms[access_crypto:save]')">
                      <icon-font class="icon" type="icon-add"/>
                      <span class="hidden-xs">添加断言</span>
                    </a-button>
                    <a-button type="primary" danger @click="removePredicate(null)" v-if="principal.hasPermission('perms[access_crypto:delete]')">
                      <icon-font class="icon" type="icon-ashbin" />
                      <span class="hidden-xs">删除选中</span>
                    </a-button>
                  </a-space>
                </a-col>
              </a-row>
            </template>

            <template #bodyCell="{ column, text, record, index }">
              <template v-if="['name', 'value', 'remark'].includes(column.dataIndex)">
                <a-form-item v-if="record.editing" has-feedback :name="['predicates', index, column.dataIndex]" :rules="{required: true, message: '该项不能为空', trigger: 'change'}">
                  <a-input v-model:value="record[column.dataIndex]"/>
                </a-form-item>
                <template v-else>
                  <span :title="text">
                  {{ text }}
                  </span>
                </template>
              </template>
              <template v-if="column.key === 'action'">
                <div class="text-center">
                  <a-space>

                    <a-button size="small" @click="cancelAndSavePredicate(record)" v-if="principal.hasPermission('perms[access_crypto:save]') && record.editing">
                      <icon-font class="icon" type="icon-select" />
                      <span class="hidden-xs">确定</span>
                    </a-button>

                    <a-button size="small" v-if="record.editing" @click="cancelAndSavePredicate(record)">
                      <icon-font class="icon" type="icon-close" />
                      <span class="hidden-xs">取消</span>
                    </a-button>

                    <a-button size="small" @click="editPredicate(record)" v-if="principal.hasPermission('perms[access_crypto:get]') && !record.editing">
                      <icon-font class="icon" type="icon-edit" />
                      <span class="hidden-xs">编辑</span>
                    </a-button>

                    <a-button size="small" type="primary" danger @click="removePredicate(record)" v-if="principal.hasPermission('perms[access_crypto:delete]') && !record.editing">
                      <icon-font class="icon" type="icon-ashbin" />
                      <span class="hidden-xs">删除</span>
                    </a-button>

                  </a-space>
                </div>
              </template>
            </template>

          </a-table>

        </a-form>

        <a-divider />

        <a-space :size="10">
          <a-button type="primary" @click="submitForm" v-if="principal.hasPermission('perms[access_crypto:save]')" :loading="spinning" >
            <icon-font class="icon" v-if="!spinning" type="icon-select" />
            <span class="hidden-xs">保存</span>
          </a-button>
          <a-button @click="$refs['edit-form'].resetFields();">
            <icon-font class="icon" type="icon-ashbin" />
            <span class="hidden-xs">重置</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"ConfigCryptoEdit",
  inject:['reload'],
  data() {
    return {
      spinning:true,
      yesOrNoOptions:[],
      statusOptions:[],
      editableData:{},
      predicate: {
        columns:[
          {
            title: "名称",
            dataIndex: "name",
            ellipsis: true,
            width: 100,
          },
          {
            title: "拦截值",
            dataIndex: "value",
            ellipsis: true,
            width: 300,
          },
          {
            title: "备注",
            dataIndex: "remark",
            ellipsis: true,
            width: 260,
          },{
            title: "操作",
            key:'action',
            fixed: "right",
            width: 175,
          }
        ],
        selectedIds:[]
      },
      form: {
        id: null,
        name: "",
        enabled:"1",
        value: "",
        requestDecrypt: "",
        responseEncrypt: "",
        predicates:[],
        remark: ""
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "change" }],
        value: [{ required: true, message: "请输入拦截值", trigger: "change" }],
        type: [{ required: true, message: "请输入类型", trigger: "change" }]
      }
    }
  },
  methods: {
    cancelAndSavePredicate(record) {
      record.editing = false;
    },
    removePredicate(record) {

      let ids = [];

      if (record) {
        ids.push(record.id);
      } else {
        this.predicate.selectedIds.forEach(o => ids.push(o));
      }

      ids.forEach(id => this.form.predicates.splice(this.form.predicates.findIndex(p => p.id === id),1));

    },
    editPredicate(record) {

      if (record) {
        let p = this.form.predicates.find(p => p.id === record.id)
        p.editing = true;
      } else {
        let id = "gen-" + this.$dayjs().unix();
        let add = {
          id: id,
          name: "",
          value: "",
          remark: "",
          editing: true,
        };

        // 点太快不给添加
        if (this.form.predicates.filter(o => o.id === id).length > 0) {
          return;
        }

        this.form.predicates.push(add);
      }

    },
    selectPredicateChange(values) {
      this.predicate.selectedIds = values;
    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;
        this.form.predicates.forEach(o => delete o.id);

        this
            .$http
            .post("/api/admin/access/crypto/save",this.form)
            .then((r) => {
              let id = r.data.data;
              this.$message.success(r.data.message);
              if (id !== this.form.id) {
                this
                    .$router
                    .push({name:"config_access_crypto_edit", query:{id}, replace:true})
                    .then(() => this.reload());
              } else {
                this.reload();
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

    this.loadConfigEnumerates({config:[{id:"DisabledOrEnabled"},{id:"YesOrNo"}]}).then((r) => {
      this.statusOptions = r.data.data.config.DisabledOrEnabled;
      this.yesOrNoOptions = r.data.data.config.YesOrNo;
    });

    if (this.$route.query.id !== undefined) {

      this
          .$http
          .get("/api/admin/access/crypto/get?id=" + this.$route.query.id)
          .then(r => {

            r.data.data.predicates = r.data.data.predicates || [];

            if (r.data.data.predicates.length > 0) {
              r.data.data.predicates.forEach(p => {p.editing = false});
            }

            this.form = r.data.data;

            this.form.enabled = this.form.enabled.value + '';
            this.form.requestDecrypt = this.form.requestDecrypt.value + '';
            this.form.responseEncrypt = this.form.responseEncrypt.value + '';

            this.spinning = false;

          })
          .catch(() => this.spinning = false);

    } else {
      this.spinning = false
    }
  }
}
</script>