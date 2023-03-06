<template>
  <template v-if="this.design">
    <a-layout class="form-designer white-background">
      <a-layout class="border">
        <a-layout-sider theme="light" width="250" class="border-right padding-md basic-box-shadow " v-if="!this.formily.preview.value">
          <component-panel @componentDragStart="onComponentDragStart" ref="component-panel" />
        </a-layout-sider>

        <a-layout-content class="basic-box-shadow">
          <div class="border-bottom padding-xs white-background basic-box-shadow ">
            <a-row>
              <a-col :span="6" class="text-left">
                <a-space v-if="!this.formily.preview.value">
                  <a-button size="small" >
                    <icon-font class="icon" type="icon-arrow-left-bold" />
                    <span class="hidden-xs hidden-sm hidden-md">回退</span>
                  </a-button>
                  <a-button size="small" ><icon-font class="icon" type="icon-arrow-right-bold" />
                    <span class="hidden-xs hidden-sm hidden-md">保留</span>
                  </a-button>
                </a-space>
              </a-col>
              <a-col :span="12" class="text-center">
                {{ this.name }}
              </a-col>
              <a-col :span="6" class="text-right">
                <a-space>
                  <a-button size="small" @click="preview" >
                    <icon-font class="icon" :type="this.formily.preview.value ? 'icon-edit' : 'icon-browse'" />
                    <span>{{this.formily.preview.value ? '返回设计' : '预览'}}</span>
                  </a-button>
                  <a-button size="small" danger @click="clear" v-if="!this.formily.preview.value">
                    <icon-font class="icon" type="icon-ashbin" />
                    <span class="hidden-xs hidden-sm hidden-md">清空</span>
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </div>
          <div v-if="this.formily.preview.value" class="text-center" style="margin-top: -1px;">
            <a-radio-group size="small" v-model:value="this.formily.preview.mode.value" button-style="solid">
              <a-radio-button v-for="c of this.formily.preview.mode.type" :key="c.key" :value="c.key">
                <icon-font class="icon" :type="c.icon" />
                <span class="hidden-xs hidden-sm hidden-md">{{c.title}}</span>
              </a-radio-button>
            </a-radio-group>
          </div>
          <div class="padding-lg height-100-percent">
            <div id="canvas" @mousedown="setCurrentItem(undefined)" :class="this.formily.current === undefined && !this.formily.preview.value && this.formily.view !== 'code' ? 'canvas border' : 'canvas'" :style="this.formily.preview.value ? this.formily.preview.mode.type.find(t => t.key === this.formily.preview.mode.value).style : ''" @dragover="componentDragOver" @drop="componentDrag" @dragleave="componentDragLeave">
              <div class="canvas-content">
                <div class="preview padding-md" v-if="this.formily.preview.value">
                  <preview-panel ref="preview-panel" :config="this.formily.config" :layout="this.formily.layout" ></preview-panel>
                  <a-divider />

                  <a-space>
                    <a-button type="primary" @click="submitForm" >
                      <icon-font class="icon" type="icon-select" />
                      <span class="hidden-xs hidden-sm hidden-md">提交</span>
                    </a-button>
                  </a-space>
                </div>

                <form-provider :form="this.formily.form">
                  <div v-if="this.formily.view === 'design' && !this.formily.preview.value">
                    <a-form :colon="this.formily.config.colon" :hide-required-mark="this.formily.config.hideRequiredMark" :label-wrap="this.formily.config.labelWrap" :layout="this.formily.config.layout" :no-style="this.formily.config.noStyle" :scroll-to-first-error="this.formily.config.scrollToFirstError" :validate-on-rule-change="this.formily.config.validateOnRuleChange">
                      <div class="text-center margin-xs-bottom">
                        <span class="form-button">
                          <icon-font class="icon" type="icon-form" />
                          <span class="hidden-xs hidden-sm hidden-md">表单</span>
                        </span>
                      </div>
                      <template v-for="item in this.formily.layout" :key="item.name">
                        <div v-if="!this.formily.preview.value" @mousedown="setCurrentItem(item, $event)" class="canvas-item" draggable="true" @dragend="this.formily.current.dragStart = false" @dragover="canvasItemDragOver" @dragleave="canvasItemDragLeave" @dragstart="this.formily.current.dragStart = true" :id="item.name" :class="item.selected === true ? ' selected' : ''">
                          <div v-if="item.field.type === 'field'">
                            <div :id="item.name + '-field'" class="canvas-item-field" >
                              <field
                                  :name="item.name"
                                  :title="item.title"
                                  :description="item.field.description"
                                  :value="item.field.value"
                                  :required="item.field.required"
                                  :disabled="item.field.disabled"
                                  :readOnly="item.field.readOnly"
                                  :decorator="item.field.decorator"
                                  :component="[item.field.component, item.field.config]"
                              />
                            </div>
                            <div class="operation bottom-right" v-if="item.selected">
                              <a-space>
                                <a-typography-text type="secondary">{{item.remark}}</a-typography-text>
                                <a-button type="link" size="small" class="padding-none" >
                                  <icon-font class="icon" type="icon-batch" @click="copyItem(item)" />
                                </a-button>
                                <a-button type="link" size="small" class="padding-none" >
                                  <icon-font class="icon" type="icon-ashbin" @click="removeItem(item)" />
                                </a-button>
                              </a-space>
                            </div>
                          </div>
                          <template v-else-if="item.field.type === 'layout'">
                            <FormConsumer>
                              <a-divider @mousedown="setCurrentItem(item, $event)" v-if="item.id === 'divider'" :ref="item.name" :dashed="item.field.config.dashed" :orientation="item.field.config.orientation.value" :plain="item.field.config.plain" :type="item.field.config.type.value">{{item.title}}</a-divider>
                              <a-row @mousedown="setCurrentItem(item, $event)" class="margin-lg-bottom" v-if="item.id === 'grid'" :align="item.field.config.row.align.value" :gutter="item.field.config.row.gutter.value" :justify="item.field.config.row.justify.value" :wrap="item.field.config.row.wrap">
                                <a-col v-for="c of item.field.config.row.col" @mousedown="setCurrentItem(item, $event, c)" :key="c.index" :span="c.span" :flex="c.flex" :order="c.order" :pull="c.pull" :push="c.push" :xxxl="c.xxxl" :xs="c.xs" :sm="c.sm" :md="c.md" :lg="c.lg" :xl="c.xl" :xxl="c.xxl" :offset="c.offset" >
                                  <div  :id="item.name + '-col-' + c.index" :class="item.field.selectedTarget && item.field.selectedTarget.index === c.index ? 'data-block selected' : 'data-block'" @dragover="componentDragOver" @drop="componentDrag" @dragleave="componentDragLeave">

                                    <div v-if="c.item" @mousedown="setCurrentColItem(c, item, $event)">
                                      <div class="canvas-item-field" :id="item.name + '-col-field' + c.index">
                                        <field
                                            :ref="c.item.name"
                                            :name="c.item.name"
                                            :title="c.item.title"
                                            :description="c.item.field.description"
                                            :value="c.item.field.value"
                                            :required="c.item.field.required"
                                            :disabled="c.item.field.disabled"
                                            :readOnly="c.item.field.readOnly"
                                            :decorator="c.item.field.decorator"
                                            :component="[c.item.field.component, c.item.field.config]"
                                        />
                                      </div>
                                    </div>
                                    <div :id="item.name + '-col-empty-' + c.index" class="empty" v-else>
                                      栅格列
                                    </div>
                                    <div class="operation-item" v-if="item.field.selectedTarget && item.field.selectedTarget.index === c.index" >

                                      <a-typography-text type="secondary" v-if="c.item" class="margin-xs-right">{{c.item.remark}}</a-typography-text>
                                      <a-space>
                                        <a-button type="link" size="small" class="padding-none" >
                                          <icon-font class="icon" type="icon-batch" @click="copyGridCol(c, item.field.config.row)" />
                                        </a-button>
                                        <a-button type="link" size="small" class="padding-none" >
                                          <icon-font class="icon" type="icon-ashbin" @click="removeGridCol(c, item.field.config.row)" />
                                        </a-button>
                                      </a-space>
                                    </div>
                                  </div>
                                </a-col>
                              </a-row>
                            </FormConsumer>
                            <div class="operation bottom-left" v-if="item.selected">
                              <a-space>
                                <a-button type="link" size="small" v-if="item.field.type === 'layout' && item.id === 'grid'" @click="addGridCol">
                                  <icon-font class="icon" type="icon-add" /> 添加栅格列
                                </a-button>
                              </a-space>
                            </div>
                            <div class="operation bottom-right" v-if="item.selected">
                              <a-space>
                                <a-typography-text type="secondary">{{item.remark}}</a-typography-text>
                                <a-button type="link" size="small" class="padding-none" >
                                  <icon-font class="icon" type="icon-batch" @click="copyItem(item)" />
                                </a-button>
                                <a-button type="link" size="small" class="padding-none" >
                                  <icon-font class="icon" type="icon-ashbin" @click="removeItem(item)" />
                                </a-button>
                              </a-space>
                            </div>
                          </template>
                          <template v-else-if="item.field.type === 'upload'">
                            <FormConsumer>
                              <a-upload-dragger class="margin-lg-bottom" style="pointer-events: none;" v-model:fileList="item.field.fileList" :disabled="item.field.disabled" :withCredentials="item.field.config.withCredentials" :directory="item.field.config.directory" :name="item.field.config.uploadName" :accept="item.field.config.accept" :multiple="item.field.config.multiple">
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
                              <div class="operation bottom-right" v-if="item.selected">
                                <a-space>
                                  <a-typography-text type="secondary">{{item.remark}}</a-typography-text>
                                  <a-button type="link" size="small" class="padding-none" >
                                    <icon-font class="icon" type="icon-batch" @click="copyItem(item)" />
                                  </a-button>
                                  <a-button type="link" size="small" class="padding-none" >
                                    <icon-font class="icon" type="icon-ashbin" @click="removeItem(item)" />
                                  </a-button>
                                </a-space>
                              </div>
                            </FormConsumer>
                          </template>
                        </div>
                      </template>
                    </a-form>
                  </div>
                  <div class="code-content" v-if="this.formily.view === 'code' && !this.formily.preview.value">
                    <a-row class="height-100-percent">
                      <a-col :span="12" class="border-right height-100-percent">
                        <div class="border-bottom padding-xss white-background text-center">
                          表单提交数据
                        </div>
                        <div class="padding-xss data">
                          <pre v-if="JSON.stringify(this.formily.form.values) !== '{}'">{{this.formily.form.values}}</pre>
                          <div v-else class="height-100-percent overflow-hidden justify-content-center align-items-center display-flex">
                            <a-empty />
                          </div>
                        </div>
                      </a-col>
                      <a-col :span="12" class="border-left height-100-percent">
                        <div class="border-bottom padding-xss white-background text-center">
                          表单布局数据
                        </div>
                        <div class="padding-xss data">
                          <pre v-if="this.getLayoutData().length > 0">{{this.getLayoutData()}}</pre>
                          <div v-else class="height-100-percent overflow-hidden justify-content-center align-items-center display-flex">
                            <a-empty />
                          </div>
                        </div>
                      </a-col>
                    </a-row>
                  </div>
                </form-provider>
              </div>
            </div>
            <div class="border-bottom padding-xss border-left border-right canvas-footer" v-if="!this.formily.preview.value">
              <a-row >
                <a-col :span="12" class="text-left">
                  <a-button size="small" type="primary" @click="submitKit()" >
                    <icon-font class="icon" type="icon-select" />
                    <span class="hidden-xs hidden-sm hidden-md">保存为配件</span>
                  </a-button>
                </a-col>
                <a-col :span="12" class="text-right">
                  <a-radio-group size="small" @change="this.clearNotExistFields" v-model:value="this.formily.view" >

                    <a-radio-button value="design">
                      <icon-font class="icon" type="icon-responsive-design" />
                      <span class="hidden-xs hidden-sm hidden-md">设计</span>
                    </a-radio-button>
                    <a-radio-button value="code">
                      <icon-font class="icon" type="icon-code" />
                      <span class="hidden-xs hidden-sm hidden-md">数据</span>
                    </a-radio-button>
                  </a-radio-group>
                </a-col>
              </a-row>
            </div>
          </div>

        </a-layout-content>

        <a-layout-sider width="350" theme="light" class="border-left basic-box-shadow attr-panel" v-if="!this.formily.preview.value">
          <properties-panel v-model:form="this.formily.config" v-model:target="this.formily.form" :component="this.formily.current" @componentChange="componentChange" @formChange="configChange" ></properties-panel>
        </a-layout-sider>
      </a-layout>
    </a-layout>

    <a-modal v-model:visible="this.kit.dialogVisible" title="新增配件" @ok="submitKitData();" layout="vertical">
      <a-spin :spinning="this.kit.spinning">
        <a-form ref="category-form" :model="this.kit.form" layout="vertical" :rules="this.kit.rules">

          <a-row :gutter="[24]">
            <a-col :span="24">
              <a-form-item label="名称:" name="title">
                <a-input v-model:value="this.kit.form.title" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :span="24">
              <a-form-item label="所属类别:" name="categoryId">
                <a-select class="width-100-percent" v-model:value="this.kit.form.categoryId">
                  <a-select-option v-for="c of this.$refs['component-panel'].getKitCategory()" :key="c.id" :value="c.id">
                    {{c.title}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="[24]">
            <a-col :span="24">
              <a-form-item label="备注:" name="remark">
                <a-textarea v-model:value="this.kit.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </a-modal>
  </template>
  <template v-else>
    <div v-show="false" >
      <component-panel @componentDragStart="onComponentDragStart" ref="component-panel" />
    </div>
    <preview-panel ref="preview-panel" :design="this.design" :name="this.name" :form-data="this.formily.data" :pattern="this.pattern" :config="this.formily.config" :layout="this.formily.layout" ></preview-panel>
  </template>
</template>

<script>

import PropertiesPanel from "@/components/form-designer/PropertiesPanel";
import ComponentPanel from "@/components/form-designer/ComponentPanel";
import PreviewPanel from "@/components/form-designer/PreviewPanel";

import {createForm} from "@formily/core";

import {
  FormProvider,
  FormConsumer,
  Field
} from '@formily/vue'

export default {
  name: "FormDesigner",
  props:{
    formData:{
      type:Object,
      default() {
        return {}
      }
    },
    layout:{
      type:Array,
      default() {
        return [];
      }
    },
    pattern:{
      type:String,
      default:"editable"
    },
    name:{
      type:String,
      default:"表单名称"
    },
    design:{
      type:Boolean,
      default:true,
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
        };
      }
    }
  },
  watch:{
    formData:{
      deep:true,
      handler (newValue) {
        this.formily.data = newValue;
        this.initFormilyData();
      }
    }
  },
  emits: ["update:layout", "update:config","layoutChange","configChange"],
  components: {
    ComponentPanel,
    PropertiesPanel,
    PreviewPanel,
    FormProvider,
    FormConsumer,
    Field,
  },
  data() {
    return {
      kit:{
        dialogVisible: false,
        spinning:false,
        form:{
          title:"",
          categoryId:"",
          remark:""
        },
        rules:{
          title: [
            { required: true, message: "请输入配件名称", trigger: "change"}
          ],
          categoryId: [
            { required: true, message: "请选择配件配别", trigger: "change"}
          ]
        },
      },
      component: {
        currentDrag:undefined,
      },
      formily:{
        data:this.formData,
        ignore:{
          value:["selected", "icon"],
          field:["decorator", "component"],
          dataSource:["editableData", "columns"],
          event:["columns", "model"],
          config:["options","fileList"],
        },
        default: {
          properties: {
            value:"basic"
          },
          field:{
            basicPropertiesValue:"basic",
            required: false,
            value: '',
            description:'',
            disabled:false,
            readOnly:false,
            event:{
              dataSource:[],
              columns:[
                {
                  title: "名称",
                  dataIndex: "name",
                  ellipsis: true,
                  width: 100
                },{
                  title: "过程",
                  dataIndex: "hasValue",
                  ellipsis: true,
                  width: 100
                },{
                  title:"操作",
                  dataIndex:"operation",
                  width: 50,
                  fixed: "right"
                }
              ],
              model:{
                visible:false,
                record: {
                  name:'',
                  functionValue:''
                },
              }
            }
          }
        },
        config:this.config,
        form:createForm({ validateFirst: true}),
        layout:[],
        current:undefined,
        view:'design',
        preview:{
          value:false,
          form:createForm({ validateFirst: true}),
          mode:{
            type:[{
              icon:"icon-electronics",
              key:"browser",
              style:{
                width:"auto",
                height:"auto"
              },
              title:"PC端"
            },{
              icon:"icon-mobile-phone",
              key:"phone",
              style:{
                width:"408px",
                minHeight:"730px",
                margin: "0 auto"
              },
              title:"手机端"
            }],
            value:"browser"
          }
        },
      }
    };
  },
  mounted() {
    this.formily.layout = this.layout.map(i => {
      let item = this.createComponentItem(i);
      this.$refs["component-panel"].initComponent(item);
      return item;
    });

    this.initFormilyData();

    if (!this.design) {

      if (this.pattern === "readPretty" || this.pattern === "disabled") {
        this.setLayoutDisabled(this.formily.layout);
      }

      this.$nextTick(() => this.$refs["preview-panel"].buildingForm());
    }
  },
  methods: {
    initFormilyData() {
      if (this.formily.data) {
        for (let key in this.formily.data) {
          let field = this.formily.layout.find(l => l.name === key);
          if (!field) {
            let grid = this.formily.layout.filter(l => l.id === 'grid');
            let items = grid.flatMap(g => g.item).flatMap(i => i.field.config.row.col).map(c => c.item);
            field = items.find(l => l.name === key);
          }
          if (!field) {
            continue;
          }

          if (field.id === 'datePicker' || field.id === 'timePicker') {
            this.formily.data[key] = this.$dayjs(this.formily.data[key]);
          } else if (field.id === 'rangePicker') {
            this.formily.data[key][0] = this.$dayjs(this.formily.data[key][0]);
            this.formily.data[key][1] = this.$dayjs(this.formily.data[key][1]);
          }
        }
      }
    },
    setLayoutDisabled(layout) {
      layout.forEach(l => {
        if (l.id === 'divider') {
          return;
        }
        if (l.id === "grid") {
          let items = l.item.flatMap(i => i.field.config.col).map(i => i.item);
          this.setLayoutDisabled(items)
        } else  {
          l.field.config.disabled = true;
        }
      });
    },
    componentChange() {
      let layoutData = this.getLayoutData();
      this.$emit("update:layout", layoutData);
      this.$emit('layoutChange', layoutData);
    },
    configChange(form, target) {
      this.formily.config = form;
      this.formily.form = target;
      this.$emit("update:config", this.formily.config);
      this.$emit('configChange', this.formily.config, this.formily.form);
    },
    submitKit() {
      if (this.formily.layout.length <= 0) {
        this.$message.success("请先对配件布局在保存配件");
        return ;
      }
      this.kit.dialogVisible = true;
    },
    submitKitData() {
      this.kit.form.layout = this.getLayoutData();
      this
          .$http
          .post("/api/workflow/kit/save", this.kit.form)
          .then((r) => {
            this.$message.success(r.data.message);
            this.$refs["component-panel"].loadKit(true);
            this.clear();

            this.resetKitForm();

            this.kit.dialogVisible = false;
            this.kit.spinning = false;
          })
          .catch(() => this.kit.spinning = false);
    },
    resetKitForm() {
      this.kit.form.id = null;
      this.kit.form.title = "";
      this.kit.form.categoryId = "";
      this.kit.form.remark = "";
    },
    resetPreviewForm() {
      this.$refs["preview-panel"].resetForm();
    },
    submitForm() {
      if (this.design) {

        this.$refs["preview-panel"].submitForm().then((r) => {
          this.clearNotExistFields();
          this.$modal.info({
            title: '提交数据',
            content: JSON.stringify(r)
          });
        });
      } else {
        return this.$refs["preview-panel"].submitForm();
      }
    },
    canvasItemDragLeave(e) {

      if (e.target.className.indexOf("canvas-item") < 0) {
        return ;
      }

      let selected = this.formily.current;
      if (selected && selected.name === e.target.id) {
        return ;
      }

      e.target.className = "canvas-item";
      e.preventDefault();
    },
    canvasItemDragOver(e) {

      if (e.target.className.indexOf("canvas-item") < 0) {
        return ;
      }

      let selected = this.formily.current;

      if (selected && selected.name === e.target.id) {
        return ;
      }

      if (e.target.id.indexOf('-col-') >= 0) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "move";
      }
      let elPosition = e.target.getBoundingClientRect().top.toFixed(0) * 1;
      let elMidPosition = e.target.offsetHeight / 2;
      if (e.clientY > elPosition + elMidPosition) {
        e.target.className = "canvas-item move-bottom";
      } else {
        e.target.className = "canvas-item move-top";
      }

      e.preventDefault();
    },
    onComponentDragStart(item) {
      this.setCurrentItem(undefined);
      this.formily.current = undefined;
      this.component.currentDrag = item;
    },
    copyGridCol(col, row) {
      let copy = JSON.parse(JSON.stringify(col))
      let index = row.col.indexOf(col);
      copy.selected = false;
      row.col.splice(index + 1, 0, copy);
      this.resetColSpan(row);
    },
    removeGridCol(col, row) {
      let index = row.col.indexOf(col);
      row.col.splice(index, 1);
      this.resetColSpan(row);
    },
    addGridCol() {
      let length = this.formily.current.field.config.row.col.length
      if (length >= 12) {
        this.$message.warn("栅格列最大只能到 12 列");
        return ;
      }
      this.formily.current.field.config.row.col.push({index:length, span:0});
      this.resetColSpan(this.formily.current.field.config.row);
    },
    resetColSpan(row) {
      let s = 24 / row.col.length;
      if (/[.]/.test(s)) {
        s = s.toFixed(0) * 1 - 1;
      }
      let index = 0;
      row.col.forEach(c => {
        c.span = s;
        c.index = index++;
      });
    },
    copyItem(item) {
      let i = this.formily.layout.find(i => i.name === item.name);
      let index = this.formily.layout.indexOf(i);
      this.formily.layout.splice(index + 1, 0, {
        name:item.id + "_" + this.$dayjs().valueOf(),
        title:i.title,
        remark:i.remark,
        field:i.field
      });
      this.componentChange();
    },
    removeItem(item) {
      let i = this.formily.layout.find(i => i.name === item.name);
      let index = this.formily.layout.indexOf(i);
      this.formily.layout.splice(index, 1);
      if (this.formily.layout.length <= 0) {
        this.formily.current = undefined;
      }
      this.componentChange();
    },
    componentDragOver(e) {

      if (this.formily.view === 'code') {
        return ;
      }

      if (this.formily.current && this.formily.current.dragStart && e.target.id.indexOf('-col-') < 0) {
        return ;
      }

      if (e.target.id !== 'canvas' && e.target.id.indexOf('-col-') < 0) {
        return ;
      }

      if (this.component.currentDrag.id === "grid" && e.target.id.indexOf('-col-') >= 0) {
        return ;
      }

      if (e.target.id === 'canvas' || e.target.id.indexOf('-col-') >= 0) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "none";
      }

      e.target.className += e.target.className.indexOf(" drag-over") >= 0 ? "" : " drag-over";
      e.preventDefault();
    },
    componentDragLeave(e) {
      if (e.target.id !== 'canvas' && e.target.id.indexOf('-col-') < 0) {
        return ;
      }
      e.target.className = e.target.className.replace("drag-over", "");
      e.preventDefault();
    },
    componentDrag(e) {

      if (e.target.id === "canvas" || e.target.id.indexOf('-col-') >= 0) {
        e.target.className = e.target.className.replace("drag-over", "");
      } else {
        e.target.className = e.target.className.replace("move-top", "").replace("move-bottom", "");
      }

      if (this.component.currentDrag) {

        let item = this.component.currentDrag;
        delete this.component.currentDrag;

        let selected = [];
        if (item.layout) {
          selected = item.layout.map(i => this.createComponentItem(i));
        } else {
          selected.push(this.createComponentItem(item));
        }

        let current = selected[selected.length - 1];

        if (e.target.className.indexOf("canvas-item") >= 0) {
          this.setCurrentItem(current);
          this.addCanvasItemByEvent(e, current);
        } else if (e.target.id && e.target.id.indexOf("-col-") >= 0) {
          let rowId = e.target.id.substring(0, e.target.id.indexOf("-"));
          let row = this.formily.layout.find(l => l.name === rowId);
          let index = e.target.id.substring(e.target.id.lastIndexOf("-") + 1, e.target.id.length) * 1;
          let col = row.field.config.row.col[index];
          col.item = current;
        } else {
          this.formily.layout.push(...selected);
        }

        if (e.target.className.indexOf("canvas-item") < 0) {
          this.$nextTick(() => {
            this.setCurrentItem(current);
            for (let key in this.formily.form.fields[current.name]) {
              if (key.startsWith("on") && !current.field.event.dataSource.find(d => d.name === key)) {
                current.field.event.dataSource.push({
                  name:key,
                  hasValue:false,
                  functionValue:""
                })
              }
            }
          });
          this.$nextTick(() => this.setCurrentItem(current));
        }
        this.componentChange();
      }

      // 在设计面板中上下移动位置的逻辑
      if (this.formily.current && this.formily.current.dragStart) {

        let selected = this.formily.current;

        if (!selected) {
          return ;
        }

        let selectedIndex = this.formily.layout.indexOf(selected);
        selected = this.formily.layout.splice(selectedIndex, 1)[0];

        if (e.target.id === "canvas") {
          this.$nextTick(() => this.formily.layout.push(selected));
        } else {
          this.addCanvasItemByEvent(e, selected);
        }

        this.componentChange();
      }

      e.preventDefault();
    },
    createComponentItem(item) {
      let itemJson = JSON.stringify(item, (key,value) => {
        if (key === "decorator" || key === "component") {
          return undefined;
        }
        return value;
      });

      let selected = JSON.parse(itemJson);

      selected.name = item.name || item.id + "_" + this.$dayjs().valueOf();
      if (!selected.remark) {
        selected.remark = item.title;
      }

      let typeDefaultValue = this.formily.default[selected.field.type];
      if (typeDefaultValue) {

        let defaultJson = JSON.stringify(typeDefaultValue, (key,value) => {
          if (selected.field[key]) {
            return undefined;
          }
          return value;
        });

        let defaultValue = JSON.parse(defaultJson);
        for (let key in defaultValue) {
          selected.field[key] = defaultValue[key];
        }

        for (let key in typeDefaultValue.event) {
          if (selected.field.event[key]) {
            continue;
          }
          selected.field.event[key] = typeDefaultValue.event[key];
        }
      }

      if (item.field.decorator) {
        selected.field.decorator = item.field.decorator;
      }

      if (item.field.component) {
        selected.field.component = item.field.component;
      }

      return selected;
    },
    addCanvasItemByEvent(e, selected) {
      let target = this.formily.layout.find(l => l.name === e.target.id);
      let targetIndex = this.formily.layout.indexOf(target);

      let elPosition = e.target.getBoundingClientRect().top.toFixed(0) * 1;
      let elMidPosition = e.target.offsetHeight / 2;

      if (e.clientY > elPosition + elMidPosition) {
        this.formily.layout.splice(targetIndex + 1, 0, selected);
      } else {
        this.formily.layout.splice(targetIndex, 0, selected);
      }

      this.componentChange();
    },
    setCurrentColItem(col, item, event) {
      this.setCurrentItem(col.item, event);
      item.field.selectedTarget = col;
      event.stopPropagation();
    },
    setCurrentItem(item, event, c) {
      this.formily.layout.forEach(i => i.selected = false);
      if (item) {
        item.selected = true;
        this.formily.current = item;

        if (c) {
          item.field.selectedTarget = c;
        } else if (item.id === "grid") {
          item.field.selectedTarget = undefined;
        }
        if (event) {
          event.stopPropagation();
        }
      } else {
        this.formily.current = undefined;
      }

    },
    clear() {
      this.formily.layout = [];
      this.clearNotExistFields();
      this.formily.current = undefined;
      this.formily.preview.value = false;
      this.componentChange();
    },
    clearNotExistFields() {

      let removeFields = [];

      for (let key in this.formily.form.fields) {
        let exist = this.formily.layout.find(l => {
          if (l.key === "grid") {
            return l.field.config.row.col.filter(c => c.item).find(c => c.item.name === key);
          } else if (l.name === key) {
            return true;
          }
          return false;
        });
        if (!exist) {
          removeFields.push(key);
        }
      }

      removeFields.forEach(k => {
        delete this.formily.form.fields[k];
        delete this.formily.form.values[k];
      });
    },
    getLayoutData() {
      return this.formily.layout.map(d => {
        if (d.key === "grid") {
          let grid = JSON.parse(JSON.stringify(d));
          grid.field.config.row.col.filter(c => c.item).forEach(c => c.item = this.filterLayoutData(c.item));
          return this.filterLayoutData(grid);
        }
        return this.filterLayoutData(d);
      });
    },
    filterLayoutData(data) {
      let itemJson = JSON.stringify(data, (key,value) => {
        if (key === "decorator" || key === "component") {
          return undefined;
        }
        return value;
      });

      let result = JSON.parse(itemJson);

      this.formily.ignore.field.forEach(f => {
        if (result.field[f] !== undefined) {
          delete result.field[f]
        }
      });
      this.formily.ignore.value.forEach(f => {
        if (result[f] !== undefined) {
          delete result[f]
        }
      });
      if (result.field.event) {
        this.formily.ignore.event.forEach(f => {
          if (result.field.event[f] !== undefined) {
            delete result.field.event[f];
          }
        });
      }
      if (result.field.dataSourceConfig) {
        this.formily.ignore.dataSource.forEach(f => {
          if (result.field.dataSourceConfig[f] !== undefined) {
            delete result.field.dataSourceConfig[f];
          }
        });
      }

      if (result.key === "grid") {

        this.formily.ignore.config.forEach(f => {
          if (result.field.config[f] !== undefined) {
            delete result.field.config[f];
          }
        });

        for (let key in result.field.config.row) {
          this.formily.ignore.config.forEach(f => {
            if (result.field.config.row[key][f] !== undefined) {
              delete result.field.config.row[key][f];
            }
          });
        }
      }

      if (result.key === "divider") {
        for (let key in result.field.config) {
          this.formily.ignore.config.forEach(f => {
            if (result.field.config[key][f] !== undefined) {
              delete result.field.config[key][f];
            }
          });
        }
      }

      if (result.key === "upload") {
        this.formily.ignore.config.forEach(f => delete result.field.config[f]);
      }

      return result;

    },
    preview() {
      this.clearNotExistFields();
      this.formily.preview.value = !this.formily.preview.value;
      if (this.formily.preview.value) {
        this.$nextTick(() => this.$refs["preview-panel"].buildingForm());
      }
    },
  }
}

</script>