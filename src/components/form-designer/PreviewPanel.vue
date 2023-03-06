<template>
    <form-provider :form="this.form">
      <a-form ref="edit-form" :colon="this.config.colon" :hide-required-mark="this.config.hideRequiredMark" :label-wrap="this.config.labelWrap" :layout="this.config.layout" :no-style="this.config.noStyle" :scroll-to-first-error="this.config.scrollToFirstError" :validate-on-rule-change="this.config.validateOnRuleChange">
        <template v-for="item in this.layout" :key="item.name">
          <field
              v-if="item.field.type === 'field'"
              :name="item.name"
              :title="item.title"
              :description="item.field.description"
              :value="item.field.value"
              :required="item.field.required"
              :readOnly="item.field.readOnly"
              :decorator="item.field.decorator"
              :component="[item.field.component, item.field.config]"
          />
          <form-consumer v-else-if="item.field.type === 'layout'">
            <a-divider :dashed="item.field.config.dashed" v-if="item.id === 'divider'" :orientation="item.field.config.orientation.value" :plain="item.field.config.plain" :type="item.field.config.type.value">{{item.title}}</a-divider>
            <a-row v-if="item.id === 'grid'" :align="item.field.config.row.align.value" :gutter="item.field.config.row.gutter.value" :justify="item.field.config.row.justify.value" :wrap="item.field.config.row.wrap">
              <a-col v-for="c of item.field.config.row.col" :key="c.index" :span="c.span" :flex="c.flex" :order="c.order" :pull="c.pull" :push="c.push" :xxxl="c.xxxl" :xs="c.xs" :sm="c.sm" :md="c.md" :lg="c.lg" :xl="c.xl" :xxl="c.xxl" :offset="c.offset" :id="item.name + '-col-' + c.index" >
                <field
                    v-if="c.item"
                    :ref="c.item.name"
                    :name="c.item.name"
                    :title="c.item.title"
                    :description="c.item.field.description"
                    :value="c.item.field.value"
                    :required="c.item.field.required"
                    :readOnly="c.item.field.readOnly"
                    :decorator="c.item.field.decorator"
                    :component="[c.item.field.component, c.item.field.config]"
                />
              </a-col>
            </a-row>
          </form-consumer>

          <form-consumer v-else-if="item.field.type === 'upload'">
            <a-upload-dragger @change="uploadMetaChange(item,$event)" v-if="this.pattern === 'editable'" class="margin-lg-bottom" v-model:fileList="item.field.config.fileList" :showUploadList="false" :disabled="item.field.disabled" :withCredentials="item.field.config.withCredentials" :directory="item.field.config.directory" :name="item.field.config.uploadName" :accept="item.field.config.accept" :multiple="item.field.config.multiple" :before-upload="beforeUpload">
              <p class="ant-upload-drag-icon">
                <icon-font type="icon-upload" />
              </p>
              <p class="ant-upload-text">
                点击或拖拽文件到该区域进行对
                <a-typography-text type="danger">[{{item.title}}]</a-typography-text>
                的文件上传
              </p>
              <div class="ant-upload-hint">
                <p v-if="item.field.config.multiple">
                  <a-typography-text type="secondary">支持多个文件进行上传</a-typography-text>
                </p>
                <p v-if="item.field.config.accept">
                  <a-typography-text type="secondary">接受上传的文件类型:{{item.field.config.accept}}</a-typography-text>
                </p>
              </div>
            </a-upload-dragger>
            <pre-upload-preview v-model:file-list="item.field.config.fileList" />
            <post-upload-preview v-if="this.uploadMeta[item.name] && this.uploadMeta[item.name].length > 0" v-model:meta="this.uploadMeta[item.name]" :delete-query="'designer=true&fieldName=' + item.name + this.data.id ? '&recordId=' + this.data.id : ''"/>
          </form-consumer>

        </template>
      </a-form>
    </form-provider>
</template>

<script>

import {
  FormProvider,
  FormConsumer,
  Field
} from '@formily/vue'
import {createForm} from "@formily/core";


import PreUploadPreview from "@/components/file/PreUploadPreview"
import PostUploadPreview from "@/components/file/PostUploadPreview"

export default {
  name: "FormDesignerPreviewPanel",
  components: {
    PreUploadPreview,
    PostUploadPreview,
    FormProvider,
    FormConsumer,
    Field
  },
  props:{
    design:{
      type:Boolean,
      default:true,
    },
    pattern:{
      type:String,
      default:"editable"
    },
    name:{
      type:String,
      default:"form/designer/preview"
    },
    config:{
      type:Object,
      default() {
        return {
          colon:true,
          hideRequiredMark:false,
          labelWrap:false,
          layout:'horizontal',
          noStyle:false,
          scrollToFirstError:false,
          validateOnRuleChange:true
        }
      }
    },
    layout:{
      type:Array,
      default() {
        return [];
      }
    },
    formData:{
      type:Object,
      default() {
        return {}
      }
    }
  },
  watch:{
    formData:{
      deep:true,
      handler (newValue) {
        this.data = newValue;
        this.initFormValues();
      }
    }
  },
  mounted() {
    this.buildingForm();
  },
  data() {
    return {
      data:this.formData,
      form:createForm({pattern:this.pattern, validateFirst: true}),
      uploadMeta:{},
    }
  },
  methods:{
    uploadMetaChange(item, e) {
      let exist = e.fileList.filter(f => this.uploadMeta[item.name].filter(m => m.originalFileName).map(m => m.originalFileName).includes(f.name));
      if (!exist || exist.length <= 0) {
        return ;
      }

      this.$message.warn(exist.map(e => e.name).join(",") + " 文件已存在，要替换文件请先删除存在文件。");

      exist.forEach(e => {
        let index = item.field.config.fileList.indexOf(e);
        item.field.config.fileList.splice(index, 1);
      });
    },
    resetForm(){
      for (let field in this.form.fields) {
        this.form.reset(field);
      }
    },
    buildingForm() {
      this.form = createForm({ validateFirst: true, pattern:this.pattern});
      if (this.pattern === "editable") {
        this.$nextTick(() => {
          this.layout.forEach(l => {
            let field = this.form.fields[l.name];
            if (!field) {
              return ;
            }
            if (!field.setComponentProps) {
              return ;
            }
            if (l.field.event && l.field.event.dataSource.length > 0) {
              let allEvent = l.field.event.dataSource.filter(ds => ds.hasValue);
              let props = {};
              allEvent.forEach(event => props[event.name] = this.createDelegate.bind(this, event.functionValue, this.form));
              this.form.fields[l.name].setComponentProps(props);
            }
            if (l.field.componentEvent && l.field.componentEvent.dataSource.length > 0) {
              let allEvent = l.field.componentEvent.dataSource.filter(ds => ds.hasValue);
              let props = {};
              allEvent.forEach(event => props[event.name] = this.createDelegate.bind(this, event.functionValue, this.form));
              this.form.fields[l.name].setComponentProps(props);
            }
          });
        });
      }
      this.initFormValues();
    },
    initFormValues() {
      let uploads = this.layout.filter(l => l.field.type === 'upload');
      if (uploads) {
        uploads.forEach(u => this.uploadMeta[u.name] = []);
      }

      if (this.data) {
        this.form.setValues(this.data);
        if (uploads) {
          uploads.forEach(u => this.uploadMeta[u.name] = this.data[u.name] || []);
        }
      }
    },
    createDelegate() {
      let functionValue = arguments[0];
      let form =  arguments[1];
      let event = [];
      for (let i = 2; i < arguments.length; i++) {
        event.push(arguments[i]);
      }
      console.info(event, form);
      eval(functionValue);
    },
    beforeUpload() {
      return false;
    },
    submitForm() {
      let type = this.design ? "temp" : "workflow";
      return new Promise((resolve, reject) => {
        this.form.validate().then(() => {
          let uploads = this.layout.filter(l => l.field.type === 'upload');
          if (uploads) {
            let param = {prefix:this.name};
            let data = [];
            uploads.forEach(upload => {
              if (upload.field.config.fileList.length <= 0) {
                return ;
              }
              upload
                  .field
                  .config
                  .fileList
                  .map(f => this.uploadFile(f, type, param, {"X-UPLOAD-NAME":upload.name}))
                  .forEach(promise => data.push({promise:promise, uploadMetaName:upload.name}));
            });
            Promise.all(data.map(d => d.promise)).then((values) => {
              values.forEach(v => {

                let d = data.find(d => d.uploadMetaName === v.res.config.headers["X-UPLOAD-NAME"]);

                if (!this.uploadMeta[d.uploadMetaName]) {
                  this.uploadMeta[d.uploadMetaName] = [];
                }
                this.uploadMeta[d.uploadMetaName].push(v.data);
              })
            });
          } else {
            resolve(this.getFormData())
          }
        }).catch((r) => reject(r));
      });

    },
    getFormData() {
      let data = JSON.parse(JSON.stringify(this.form.values));
      for (let key in this.uploadMeta) {
        data[key] = this.uploadMeta[key];
      }
      this.uploadMeta = {};
      return data;
    }
  }
}
</script>