<template>
  <div>
    <a-breadcrumb class="hidden-xs">
      <a-breadcrumb-item><router-link to='/'><icon-font class="icon" type="icon-home" /> 首页</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-enum-major-o" /> 基础信息配置</a-breadcrumb-item>
      <a-breadcrumb-item><router-link :to="{name:'config_dictionary'}"> <icon-font class="icon" type="icon-dictionary" /> 数据字典管理</router-link></a-breadcrumb-item>
      <a-breadcrumb-item><icon-font class="icon" type="icon-edit" /> {{ (this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '字典类型' }}</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card :title="(this.form.id ? '编辑 [' + this.form.name + '] ': '添加') + '字典类型'" class="basic-box-shadow">

      <template #extra>
        <icon-font class="icon" type="icon-edit" />
      </template>

      <a-spin :spinning="this.spinning">
        <a-form ref="edit-form" :model="this.form" :rules="rules" layout="vertical">

          <a-row :gutter="[24]">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="名称:" name="name" @change="nameChange">
                <a-input v-model:value="this.form.name" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" :xxl="12">
              <a-form-item label="代码:" name="code">
                <a-input ref="code" :addon-before="this.parentCode" :disabled="this.form.id !== null" v-model:value="this.form.code" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="上级:" name="parentId" v-if="this.form.parentId">
            <a-select :disabled="!this.form.id" show-search class="width-100-percent" v-model:value="this.form.parentId" @change="parentChange" optionFilterProp="key">
              <a-select-option key="" value="">无</a-select-option>
              <a-select-option v-for="p of this.parentOptions" :key="p.name" :value="p.id">
                {{p.name}}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="备注:" name="remark">
            <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
          </a-form-item>

          <a-card title="数据字典内容" v-if="this.form.id !== null">

            <template #extra>
              <icon-font class="icon" type="icon-database" />
            </template>

            <a-input v-model:value="this.dataDictionary.form['filter_[code_like]']" @pressEnter="this.searchDataDictionary(1,$event)"  placeholder="请输入名称进行查询" class="margin-lg-bottom">
              <template #addonAfter>
                <a-button size="small" type="text" @click="searchDataDictionary()">
                  <icon-font class="icon" type="icon-search" />
                  <span class="hidden-xs">搜索</span>
                </a-button>
              </template>
              <template #addonBefore>
                <a-dropdown size="small" type="text" placement="bottomLeft">
                  <template #overlay>
                    <a-menu @click="handleMenuClick" >
                      <a-menu-item key="add" :disabled="!this.principal.hasPermission('perms[data_dictionary:save]')">
                        <a-space>
                          <icon-font class="icon" type="icon-add" />
                          添加
                        </a-space>
                      </a-menu-item>
                      <a-menu-item key="delete" :disabled="this.dataDictionary.selectedIds.length <= 0 || !this.principal.hasPermission('perms[data_dictionary:delete]')">
                        <a-space>
                          <icon-font class="icon" type="icon-ashbin" />
                          删除选中({{this.dataDictionary.selectedIds.length}})
                        </a-space>
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button size="small" type="text">
                    <icon-font class="icon" type="icon-setting"/>
                    操作
                  </a-button>
                </a-dropdown>
              </template>
            </a-input>

            <a-table :loading="this.dataDictionary.loading" class="ant-table-striped" :row-selection="{ selectedRowKeys: this.dataDictionary.selectedIds, onChange: selectDataDictionaryChange}" :rowKey="record=>record.id" :scroll="{ x: this.dataDictionary.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.dataDictionary.page.elements" :columns="this.dataDictionary.columns" bordered>
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                  <template v-if="record.remark">
                    <a-tooltip :title="record.remark">
                      <a-typography-text type="warning">
                        <icon-font class="icon" type="icon-help"/>
                      </a-typography-text>
                    </a-tooltip>
                    {{record.name}}
                  </template>
                  <template v-else>
                    {{record.name}}
                  </template>
                </template>
                <template v-if="column.key === 'action'">
                  <div class="text-center">
                    <a-dropdown size="small" placement="bottomRight">
                      <template #overlay>
                        <a-menu @click="handleMenuClick($event, record)" >
                          <a-menu-item key="addChildren" :disabled="!this.principal.hasPermission('perms[data_dictionary:get]')">
                            <a-space>
                              <icon-font class="icon" type="icon-tree-table" />
                              添加子类
                            </a-space>
                          </a-menu-item>
                          <a-menu-item key="add" :disabled="!this.principal.hasPermission('perms[data_dictionary:get]')">
                            <a-space>
                              <icon-font class="icon" type="icon-edit" />
                              编辑
                            </a-space>
                          </a-menu-item>
                          <a-menu-item key="delete" :disabled="!this.principal.hasPermission('perms[data_dictionary:delete]')">
                            <a-space>
                              <icon-font class="icon" type="icon-ashbin" />
                              删除
                            </a-space>
                          </a-menu-item>
                        </a-menu>
                      </template>
                      <a-button size="small">
                        <icon-font class="icon" type="icon-setting"/>
                        操作
                      </a-button>
                    </a-dropdown>
                  </div>
                </template>
              </template>
            </a-table>

            <div class="margin-md-top text-right" >

              <a-space>
                <span class="hidden-xs">每页</span>
                <a-input v-model:value="this.dataDictionary.page.size" size="small" @pressEnter="searchDataDictionary(1,$event)" :maxlength="4" class="text-center hidden-xs" style="width: 50px" />
                <span class="hidden-xs">条 / 第 {{this.dataDictionary.page.number}} 页</span>
                <a-button size="small" @click="searchDataDictionary(this.dataDictionary.page.number - 1)" :disabled="this.dataDictionary.page.first"><icon-font class="icon" type="icon-arrow-left-bold" /></a-button>
                <a-button size="small" @click="searchDataDictionary(this.dataDictionary.page.number + 1)" :disabled="this.dataDictionary.page.last"><icon-font class="icon" type="icon-arrow-right-bold" /></a-button>
              </a-space>

            </div>

          </a-card>

        </a-form>

        <a-divider />

        <a-space>
          <a-button type="primary" @click="submitForm" v-if="this.principal.hasPermission('perms[dictionary_type:save]')" :loading="this.spinning" >
            <icon-font class="icon" v-if="!this.spinning" type="icon-select" />
            <span class="hidden-xs">保存</span>
          </a-button>
        </a-space>

      </a-spin>

    </a-card>
  </div>
</template>

<script>

export default {
  name:"AdminDictionaryTypeEdit",
  inject:['reload'],
  data() {
    return {
      dataDictionary: {
        loading:false,
        selectedIds:[],
        columns:[{
          title: "代码",
          dataIndex: "code",
          ellipsis: true,
          width: 300
        },{
          title: "名称",
          dataIndex: "name",
          ellipsis: true,
          width: 150
        },{
          title: "值",
          dataIndex: "value",
          ellipsis: true,
          width: 150
        },{
          title: "操作",
          align: "center",
          fixed: "right",
          key:"action",
          width: 100
        }],
        page: {
          elements:[],
          first:true,
          last:true,
          number:1
        },
        form:{
          typeId:0
        }
      },
      parentCode:"",
      spinning:true,
      parentOptions:[],
      form: {
        id: null,
        code: "",
        name: "",
        remark: "",
        parentId: ""
      },
      rules: {
        code: [
          { required: true, message: "请输入代码", trigger: "blur" },
          { validator:this.validateRemoteCode, trigger: "change"}
        ],
        name: [{ required: true, message: "请输入名称", trigger: "blur" }]
      }
    }
  },
  watch: {
    parentCode() {
      this.form.code = this.form.code.replace(this.parentCode, "");
    }
  },
  methods: {
    handleMenuClick(e, record) {
      if (e.key === 'delete') {
        if (record) {
          this.confirm("确定要删除" + record.name + "数据字典吗?", () => this.removeDataDictionary([record.id]));
        } else if (this.dataDictionary.selectedIds.length > 0){
          this.confirm("确定要删除" + this.dataDictionary.selectedIds.length + "条记录吗?", () => this.removeDataDictionary(this.dataDictionary.selectedIds));
        }
      } else if (e.key === 'add' || e.key === 'edit')  {
        this.editDataDictionary(record);
      } else if (e.key === "addChildren") {
        this.editDataDictionary(undefined, record);
      }
    },
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
        this.$http.get("/api/admin/dictionary/isDictionaryTypeCodeUnique?code=" + this.parentCode + this.form.code).then(r => {
          return r.data.data ? resolve() : reject("类型代码已存在");
        });
      });
    },
    parentChange(v) {

      let code = "";

      if (v !== "") {
        let parent = this.parentOptions.find(o => o.id === v * 1);
        code = parent.code + ".";
      }

      this.parentCode = code;

    },
    searchDataDictionary(number) {

      this.dataDictionary.loading = true;

      let param = this.dataDictionary.form;

      param.size = this.dataDictionary.page.size || 10;
      param.number = number || this.dataDictionary.page.number;

      if (this.form.id) {
        param["filter_[type_id_eq]"] = this.form.id;
      }

      this
          .$http
          .post("/api/admin/dictionary/getDataDictionaryPage",this.formUrlEncoded(param))
          .then(r => {
            this.dataDictionary.page = r.data.data;
            this.dataDictionary.loading = false;
          })
          .catch(() => this.dataDictionary.loading = false);
    },
    editDataDictionary(record, parentRecord) {
      let to = {
        name: "config_data_dictionary_edit",
        query:{}
      }

      if (this.form.id) {
        to.query.typeId = this.form.id;
      }

      if (record) {
        to.query.id = record.id;
      }

      if (parentRecord) {
        to.query.parentId = parentRecord.id;
      }

      this.$router.push(to);
    },
    removeDataDictionary(ids) {

      this
          .$http
          .post("/api/admin/dictionary/deleteDataDictionary",this.formUrlEncoded({ids:ids})).then((r) => {
            this.$message.success(r.data.message);
            this.dataDictionary.selectedIds = [];
            this.searchDataDictionary();
          })
          .catch(() => this.dataDictionary.loading = false);
    },
    selectDataDictionaryChange(values) {
      this.dataDictionary.selectedIds = values;
    },
    submitForm() {

      this.$refs['edit-form'].validate().then(() => {

        this.spinning = true;

        this
            .$http
            .post("/api/admin/dictionary/saveDictionaryType",this.form)
            .then((r) => {

              let id = r.data.data;

              this.$message.success(r.data.message);

              if (id !== this.form.id) {
                this.$router.push({name:"dictionary_type_edit", query:{id}, replace:true}).then(() => this.reload());
                this.form.id = r.data.data;
              }

              this.spinning = false;

            })
            .catch(() => this.spinning = false);

      });
    }
  },
  created() {

    this.loadConfigEnumerate({service:"admin", enumerateName:"DisabledOrEnabled"}).then((r) => this.statusOptions = r.data.data);

    let findParentParam = {
      mergeTree:false
    }

    if (this.$route.query.id !== undefined) {

      findParentParam["filter_[id_ne]"] = this.$route.query.id;

    } else {
      this.spinning = false
    }

    this
        .$http
        .post("/api/admin/dictionary/findDictionaryType",this.formUrlEncoded(findParentParam))
        .then(r => {

          this.parentOptions = r.data.data;

          if (this.$route.query.id !== undefined) {
            this
                .$http
                .get("/api/admin/dictionary/getDictionaryType?id=" + this.$route.query.id)
                .then(r => {

                  this.form = r.data.data;

                  this.parentChange(this.form.parentId);

                  this.spinning = false;

                  this.searchDataDictionary(null);
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
  }
}
</script>