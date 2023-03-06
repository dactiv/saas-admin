<template>
  <div class="text-center">
    <a-radio-group v-model:value="component.radioGroup" button-style="solid">
      <a-radio-button v-for="c of this.component.layout" :key="c.target" :value="c.target">
        <icon-font class="icon" :type="c.icon" />
        <span class="hidden-xs hidden-sm hidden-md">{{c.title}}</span>
      </a-radio-button>
    </a-radio-group>
  </div>

  <a-button size="small" block class="margin-lg-top" @click="editCategory()" v-if="component.radioGroup === 'kit'">
    <icon-font class="icon" type="icon-category" />
    <span class="hidden-xs hidden-sm hidden-md">新增配件类型</span>
  </a-button>

  <a-divider v-if="component.radioGroup === 'kit'"></a-divider>

  <div v-for="c of this.component.layout" :key="c.target">
    <div v-if="component.radioGroup === c.target">
      <template v-if="c.group.length > 0">
        <div v-for="g of c.group" :key="g.id">
          <a-divider orientation="left" class="font-size">
            <icon-font v-if="g.icon" class="icon margin-xs-right" :type="g.icon ? g.icon : 'icon-category' " />
            <a-space>
              <span class="hidden-xs hidden-sm hidden-md">{{ g.title }}</span>
              <a-typography-link @click="editCategory(g.id)" v-if="component.radioGroup === 'kit'">
                <a-typography-text type="secondary">
                  <icon-font class="icon" type="icon-edit" />
                  <span class="hidden-xs hidden-sm hidden-md">编辑</span>
                </a-typography-text>
              </a-typography-link>
              <a-typography-link v-if="component.radioGroup === 'kit'" @click="this.confirm('确定要删除 [' + g.title + '] 类别吗?',() => deleteCategory(g.id))">
                <a-typography-text type="danger" danger>
                  <icon-font class="icon" type="icon-ashbin" />
                  <span class="hidden-xs hidden-sm hidden-md">删除</span>
                </a-typography-text>
              </a-typography-link>
            </a-space>
          </a-divider>

          <a-row :gutter="[16,16]">
            <a-col :span="12" v-for="i of g.item" :key="i.id">
              <a-card :id="i.id" hoverable size="small" draggable="true" @dragstart="componentDragStart" class="text-center">
                <template #title v-if="component.radioGroup === 'kit'">
                  <a @click="this.confirm('确定要删除 [' + i.title + '] 配件吗?',() => deleteKit(i.id))">
                    <a-typography-text type="danger">
                      <icon-font class="icon" type="icon-ashbin" />
                      <span class="hidden-xs hidden-sm hidden-md">删除</span>
                    </a-typography-text>
                  </a>
                </template>
                <p class="margin-none"><icon-font class="icon" :type="i.icon ? i.icon : 'icon-validate-form' " /></p>
                <a-typography-text :ellipsis="{ tooltip: i.title}" :content="i.title" class="hidden-xs hidden-sm hidden-md" />
              </a-card>
            </a-col>
          </a-row>
        </div>
      </template>
    </div>
  </div>

  <a-modal v-model:visible="this.dialogVisible" :title="this.form.id === null ? '新增配件类别' : '编辑 [' + this.form.title + '] 类别'" @ok="submitForm();" layout="vertical">
    <a-spin :spinning="this.spinning">
      <a-form ref="category-form" :model="this.form" layout="vertical" :rules="this.rules">

        <a-row :gutter="[24]">
          <a-col :span="24">
            <a-form-item label="名称:" name="title">
              <a-input v-model:value="this.form.title" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[24]">
          <a-col :span="24">
            <a-form-item label="备注:" name="remark">
              <a-textarea v-model:value="this.form.remark" :auto-size="{ minRows: 5, maxRows: 10 }"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>

</template>


<script>
import {
  Form,
  Input,
  InputNumber,
  RadioGroup,
  Textarea,
  Select,
  CheckboxGroup,
  DatePicker,
  RangePicker,
  Cascader,
  TimePicker
} from 'ant-design-vue'

import {connect, mapProps} from "@formily/vue";

export default {
  name: "FormDesignerComponentPanel",
  emits: ["componentDragStart"],
  methods:{
    componentDragStart(e) {
      let item = this.getComponent(e.target.id);
      if (item === null) {
        return ;
      }
      this.$emit("componentDragStart", item);
    },
    getComponent(id) {
      let item = this.component.layout.flatMap(l => l.group).flatMap(g => g.item).find(i => i.id.toString() === id);

      if (!item || (!item.field && !item.layout)) {
        return null;
      }

      if (item.layout) {
        let layout = item.layout;

        if (layout.length <= 0) {
          console.warn("当前的 layout 中没有数据")
          return null;
        } else {
          layout.forEach(item => this.initComponent(item));
        }
      }

      return item;
    },
    initComponent(item) {
      let exist = this.component.layout.flatMap(l => l.group).flatMap(g => g.item).find(i => i.id.toString() === item.id);

      if (!exist) {
        console.warn("找不到 ID 为 [" + item.id + "] 的控件信息");
        return ;
      }

      if (!item.icon) {
        item.icon = exist.icon;
      }

      for (let key in exist.field) {
        if (item.field[key]) {
          continue;
        }
        item.field[key] = exist.field[key];
      }

      if (item.field.config) {
        for (let key in exist.field.config) {
          if (item.field.config[key]) {
            continue;
          }
          item.field.config[key] = exist.field.config[key];
        }
      }

      if (item.field.dataSourceConfig) {
        for (let key in exist.field.dataSourceConfig) {
          if (item.field.dataSourceConfig[key]) {
            continue;
          }
          item.field.dataSourceConfig[key] = exist.field.dataSourceConfig[key];
        }
      }
    },
    editCategory(id) {
      this.dialogVisible = true;
      this.spinning = true;
      if (id) {
        this
            .$http
            .get("/api/workflow/kit/category/get?id=" + id)
            .then((r) => {
              this.form = r.data.data;
              this.spinning = false;
            }).catch(() => this.spinning = false);
      } else {
        this.resetForm();
        this.spinning = false;
      }
    },
    deleteKit(id) {
      this
          .$http
          .post("/api/workflow/kit/delete", this.formUrlEncoded({ids:id}))
          .then((r) => {
            this.$message.success(r.data.message);
            this.loadKit();
          });
    },
    deleteCategory(id) {
      this
        .$http
        .post("/api/workflow/kit/category/delete", this.formUrlEncoded({ids:id}))
        .then((r) => {
          this.$message.success(r.data.message);
          this.loadKit();
        });
    },
    submitForm() {
      this.$refs["category-form"].validate().then(() => {
        this.spinning = true;
        this
            .$http
            .post("/api/workflow/kit/category/save", this.form)
            .then(() => {
              this.loadKit();
              this.resetForm();

              this.dialogVisible = false;
              this.spinning = false;
            })
            .catch(() => this.spinning = false);
      });

    },
    resetForm() {
      this.form.id = null;
      this.form.title = "";
      this.form.remark = "";
    },
    loadKit(toKit) {
      this.$http.post("/api/workflow/kit/category/find?body=true").then((r) => {
        let kit = this.component.layout.find(l => l.target === 'kit');
        kit.group = [];
        kit.group.push(...r.data.data)
        if (toKit) {
          this.component.radioGroup = "kit";
        }
      })
    },
    getKitCategory() {
      return this.component.layout.find(l => l.target === 'kit').group;
    },
  },
  created() {
    this.loadKit();
  },
  data() {
    const FormItem = connect(
        Form.Item,
        mapProps(
            { validateStatus: true, title: 'label', required: true },
            (props, field) => {
              return {
                help: field.selfErrors.length ? field.selfErrors : undefined,
                extra: field.description,
              }
            }
        )
    );
    return {
      spinning:false,
      dialogVisible:false,
      rules:{
        title: [
          { required: true, message: "请输入类别名称", trigger: "change"}
        ],
      },
      form:{
        id:null,
        name:"",
        remark:""
      },
      component:{
        radioGroup:"component",
        layout:[{
          target:"component",
          icon: "icon-form",
          title:"控件",
          group:[{
            id:"layout",
            title:"布局",
            icon:"icon-layout",
            item:[{
              icon:"icon-grid",
              id:"grid",
              title:"栅格",
              field: {
                basicPropertiesValue:"grid-basic",
                config:{
                  row:{
                    align:{
                      value:"top",
                      options:[{label:"顶部", value:"top"}, {label:"中间", value:"middle"}, {label:"底部", value:"bottom"}]},
                    gutter:{
                      selected:"interval-range",
                      value:[8,8],
                      options:[{label:"像素", value:"pixel", defaultValue:0}, {label:"水平或垂直间距",value:"interval-range", defaultValue: [8,8]}]
                    },
                    justify:{
                      value:"start",
                      options:[{label:"开始", value:"start"},{label:"结尾",value:"end"}, {label:"居右",value:"中间"},{value:'空间周围'}, {value:'区隔空间'}]
                    },
                    wrap:false,
                    col:[{index:0, span:12},{index:1, span:12}],
                  }
                },
                selected: {
                  value:"row"
                },
                type:"layout"
              }
            },{
              icon:"icon-divider",
              title:"分割线",
              id:"divider",
              field: {
                basicPropertiesValue:"divider-basic",
                config:{
                  dashed:false,
                  orientation:{
                    value:'center',
                    options:[{label:"居中", value:"center"},{label:"居左",value:"left"}, {label:"居右",value:"right"}]
                  },
                  plain:false,
                  type:{
                    value:'horizontal',
                    options:[{label:"水平", value:"horizontal"},{label:"垂直", value:"vertical"}]
                  }
                },
                type:"layout"
              }
            }]
          },{
            id:"formComponent",
            title:"表单控件",
            icon:"icon-form",
            item:[{
              icon:"icon-input",
              id:"input",
              title:"单行输入框",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onPressEnter",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: Input,
                config:{placeholder:'请输入内容'},
                type:"field"
              }
            },{
              icon:"icon-textarea",
              id:"textarea",
              title:"多行输入框",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onPressEnter",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: Textarea,
                config:{placeholder:'请输入内容'},
                type:"field"
              }
            },{
              icon:"icon-number-input",
              id:"numberInput",
              title:"数字输入框",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onPressEnter",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: InputNumber,
                config:{placeholder:'请输入内容', style:"width: 100%", precision:0},
                type:"field"
              }
            },{
              icon:"icon-datetime",
              id:"datePicker",
              title:"日期选择框",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: DatePicker,
                config:{placeholder:'请选择', format:"YYYY-MM-DD", showTime:false, style:"width: 100%"},
                type:"field"
              }
            },{
              icon:"icon-date-range",
              id:"rangePicker",
              title:"范围时间框",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  }, {
                    name:"onCalendarChange",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                value:[],
                decorator:[FormItem],
                component: RangePicker,
                config:{format:"YYYY-MM-DD", showTime:false, style:"width: 100%"},
                type:"field"
              }
            },{
              icon:"icon-time",
              id:"timePicker",
              title:"时间选择框",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  }, {
                    name:"onOpenChange",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: TimePicker,
                config:{placeholder:'请选择', format:"HH:mm:ss", style:"width: 100%"},
                type:"field"
              }
            },{
              icon:"icon-select-box",
              id:"selectBox",
              title:"选择器",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onDeselect",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onInputKeyDown",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onMouseenter",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onMouseleave",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onPopupScroll",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onSearch",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onSelect",
                    hasValue:false,
                    functionValue:""
                  },{
                    name:"onDropdownVisibleChange",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: Select,
                config:{options:[]},
                type:"field",
                mode:{
                  value:'combobox',
                  options:[{label:"单选", value:"combobox"}, {label:"多选",value:"multiple"},{label:"标签",value:"tags"}]
                },
                dataSourceConfig:{
                  map:"options",
                  editableData:{},
                  leaf:false,
                  remoteUrl:undefined,
                  dataType:{
                    value:"custom",
                    options:[{label:"自定义", value:"custom"},{label:"远程数据", value:"remote"}]
                  },
                  columns:[
                    {
                      title: "标签",
                      dataIndex: "label",
                      ellipsis: true,
                      width: 100
                    },
                    {
                      title: "值",
                      dataIndex: "value",
                      ellipsis: true,
                      width: 100
                    },{
                      title:"操作",
                      dataIndex:"operation",
                      align:'center',
                      width: 95,
                      fixed: "right"
                    }
                  ]
                }
              }
            },{
              icon:"icon-cascader",
              id:"cascader",
              title:"级联选择器",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  }, {
                    name:"onPopupVisibleChange",
                    hasValue:false,
                    functionValue:""
                  }, {
                    name:"onSearch",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: Cascader,
                config:{options:[]},
                type:"field",
                dataSourceConfig:{
                  map:"options",
                  editableData:{},
                  remoteUrl:undefined,
                  leaf:true,
                  dataType:{
                    value:"custom",
                    options:[{label:"自定义", value:"custom"},{label:"远程数据", value:"remote"}]
                  },
                  columns:[
                    {
                      title: "标签",
                      dataIndex: "label",
                      ellipsis: true,
                      width: 100
                    },
                    {
                      title: "值",
                      dataIndex: "value",
                      ellipsis: true,
                      width: 100
                    },{
                      title:"操作",
                      dataIndex:"operation",
                      width: 95,
                      fixed: "right"
                    }
                  ]
                }
              }
            },{
              icon:"icon-radio",
              id:"radio",
              title:"单选",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: RadioGroup,
                config:{options:[]},
                type:"field",
                dataSourceConfig:{
                  map:"options",
                  editableData:{},
                  columns:[
                    {
                      title: "标签",
                      dataIndex: "label",
                      ellipsis: true,
                      width: 100
                    },
                    {
                      title: "值",
                      dataIndex: "value",
                      ellipsis: true,
                      width: 100
                    },{
                      title:"操作",
                      dataIndex:"operation",
                      width: 50,
                      fixed: "right"
                    }
                  ]
                }
              }
            },{
              icon:"icon-checkbox",
              id:"checkbox",
              title:"多选",
              field: {
                componentEvent:{
                  dataSource:[{
                    name:"onChange",
                    hasValue:false,
                    functionValue:""
                  }]
                },
                decorator:[FormItem],
                component: CheckboxGroup,
                config:{options:[]},
                type:"field",
                value:[],
                multiple:true,
                dataSourceConfig:{
                  map:"options",
                  editableData:{},
                  columns:[
                    {
                      title: "标签",
                      dataIndex: "label",
                      ellipsis: true,
                      width: 100
                    },
                    {
                      title: "值",
                      dataIndex: "value",
                      ellipsis: true,
                      width: 100
                    },{
                      title:"操作",
                      dataIndex:"operation",
                      width: 50,
                      fixed: "right"
                    }
                  ]
                }
              }
            },{
              icon:"icon-upload",
              id:"upload",
              title:"上传",
              field: {
                basicPropertiesValue:"upload-basic",
                config:{
                  fileList:[],
                  uploadName:"file",
                  directory:false,
                  multiple:true
                },
                type:"upload"
              }
            }]
          }]
        },{
          target: "kit",
          icon:"icon-plugin",
          title: "配件",
          group:[]
        }]
      }
    }
  }
}
</script>