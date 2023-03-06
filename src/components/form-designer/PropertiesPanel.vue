<template>
  <div class="border-bottom padding-xs white-background text-center">
    <icon-font class="icon margin-xs-right" type="icon-un-config-o" />
    <span class="hidden-xs hidden-sm hidden-md">属性面板</span>
  </div>
  <template v-if="this.componentData">
    <a-divider class="font-size">
      <icon-font class="icon margin-xs-right" :type="this.componentData.icon" />
      <span class="hidden-xs hidden-sm hidden-md">{{this.componentData.remark}}属性</span>
    </a-divider>
    <a-collapse :accordion="true" v-model:activeKey="this.componentData.field.basicPropertiesValue" >
      <a-collapse-panel key="grid-basic" header="基本属性" v-if="this.componentData.field.type === 'layout' && this.componentData.id === 'grid' && !this.componentData.field.selectedTarget">
        <a-form layout="vertical">
          <a-form-item label="垂直对齐方式:">
            <a-select v-model:value="this.componentData.field.config.row.align.value" @change="componentChange()" :options="this.componentData.field.config.row.align.options"/>
          </a-form-item>
          <a-form-item label="间隔类型:">
            <a-select v-model:value="this.componentData.field.config.row.gutter.selected" @change="gridRowGutterChange" :options="this.componentData.field.config.row.gutter.options"/>
          </a-form-item>
          <a-form-item label="间隔值:">
            <a-row :gutter="8" v-if="this.componentData.field.config.row.gutter.selected === 'interval-range'">
              <a-col :span="12">
                <a-input-number v-model:value="this.componentData.field.config.row.gutter.value[0]" @change="componentChange()" placeholder="水平间隔" class="width-100-percent"/>
              </a-col>
              <a-col :span="12">
                <a-input-number v-model:value="this.componentData.field.config.row.gutter.value[1]" @change="componentChange()" placeholder="垂直间隔" class="width-100-percent"/>
              </a-col>
            </a-row>
            <a-input v-else-if="this.componentData.field.config.row.gutter.selected === 'pixel'" v-model:value="this.componentData.field.config.row.gutter.value" placeholder="像素值"/>
          </a-form-item>
          <a-form-item label="水平排列方式:">
            <a-select v-model:value="this.componentData.field.config.row.justify.value" @change="componentChange()" :options="this.componentData.field.config.row.justify.options"/>
          </a-form-item>
          <a-form-item label="是否自动换行:">
            <a-switch v-model:checked="this.componentData.field.config.row.wrap" @change="componentChange()"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="grid-basic" header="基本属性" v-if="this.componentData.field.type === 'layout' && this.componentData.id === 'grid' && this.componentData.field.selectedTarget">
        <a-form layout="vertical">
          <a-form-item label="flex 布局填充:">
            <a-input-number v-model:value="this.componentData.field.selectedTarget.flex" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
          <a-form-item label="左侧的间隔格数:" help="间隔内不可以有栅格">
            <a-input-number v-model:value="this.componentData.field.selectedTarget.offset" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
          <a-form-item label="栅格顺序:" help="flex 布局模式下有效">
            <a-input-number v-model:value="this.componentData.field.selectedTarget.order" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
          <a-form-item label="栅格向左移动格数:">
            <a-input-number v-model:value="this.componentData.field.selectedTarget.pull" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
          <a-form-item label="栅格向右移动格数:">
            <a-input-number v-model:value="this.componentData.field.selectedTarget.push" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
          <a-form-item label="栅格占位格数:" help="为 0 时相当于 display: none">
            <a-input-number v-model:value="this.componentData.field.selectedTarget.span" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="grid-basic-col" header="响应式属性" v-if="this.componentData.field.type === 'layout' && this.componentData.id === 'grid' && this.componentData.field.selectedTarget">
        <a-form-item label="视图 ≥2000px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.xxxl" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
        <a-form-item label="视图 <576px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.xs" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
        <a-form-item label="视图 ≥576px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.sm" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
        <a-form-item label="视图 ≥768px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.md" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
        <a-form-item label="视图 ≥992px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.lg" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
        <a-form-item label="视图 ≥1200px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.xl" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
        <a-form-item label="视图 <1600px 响应式栅格数量:">
          <a-input-number v-model:value="this.componentData.field.selectedTarget.xxl" @change="componentChange()" class="width-100-percent"/>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="divider-basic" header="基本属性" v-if="this.componentData.field.type === 'layout' && this.componentData.id === 'divider'">
        <a-form layout="vertical" >
          <a-form-item label="默认值:">
            <a-input v-model:value="this.componentData.title" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="是否虚线:">
            <a-switch v-model:checked="this.componentData.field.config.dashed" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="分割线标题位置:">
            <a-select v-model:value="this.componentData.field.config.orientation.value" @change="componentChange()" :options="this.componentData.field.config.orientation.options"/>
          </a-form-item>
          <a-form-item label="文字普通正文样式:">
            <a-switch v-model:checked="this.componentData.field.config.plain" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="布局类型:">
            <a-select v-model:value="this.componentData.field.config.type.value" @change="componentChange()" :options="this.componentData.field.config.type.options"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="upload-basic" header="基本属性" v-if="this.componentData.field.type === 'upload'">
        <a-form layout="vertical">
          <a-form-item label="字段名称:">
            <a-input v-model:value="this.componentData.name" @change="componentChange()" />
          </a-form-item>
          <a-form-item label="是否禁用:">
            <a-switch v-model:checked="this.componentData.field.disabled" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="上传请求时是否携带 cookie:">
            <a-switch v-model:checked="this.componentData.field.config.withCredentials" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="区域标签:">
            <a-input v-model:value="this.componentData.title" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="是否支持多文件上传:">
            <a-switch v-model:checked="this.componentData.field.config.multiple" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="接受上传的文件类型">
            <template #help>
              <p>参考 <a-typography-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept">input accept Attribute</a-typography-link></p>
            </template>
            <a-input v-model:value="this.componentData.field.config.accept" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="服务器接收的文件参数名">
            <a-input v-model:value="this.componentData.field.config.uploadName" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="是否支持上传文件夹">
            <a-switch v-model:checked="this.componentData.field.config.directory" @change="componentChange()"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="basic" header="基本属性" v-if="this.componentData.field.type === 'field'">
        <a-form layout="vertical" >
          <a-form-item label="标签名称:">
            <a-input v-model:value="this.formTarget.fields[this.componentData.name].title" @change="emitUpdateComponentAndForm('title')"/>
          </a-form-item>
          <a-form-item label="字段名称:">
            <a-input v-model:value="this.componentData.name" @change="componentChange()" />
          </a-form-item>
          <a-form-item label="默认值:" v-if="this.componentData.id === 'selectBox'">
            <a-select :mode="this.componentData.field.config.mode" v-model:value="this.formTarget.fields[this.componentData.name].value" :options="this.componentData.field.config[this.componentData.field.dataSourceConfig.map]" @change="emitUpdateComponentFieldAndForm('value')"/>
          </a-form-item>
          <a-form-item label="默认值:" v-else-if="this.componentData.id === 'numberInput'">
            <a-input-number class="width-100-percent" v-model:value="this.formTarget.fields[this.componentData.name].value" @change="emitUpdateComponentFieldAndForm('value')" />
          </a-form-item>
          <a-form-item label="默认值:" v-else-if="this.componentData.id === 'datePicker'">
            <a-date-picker class="width-100-percent" :show-time="this.componentData.field.config.showTime" :format="this.componentData.field.config.format" v-model:value="this.formTarget.fields[this.componentData.name].value" @change="emitUpdateComponentFieldAndForm('value')" />
          </a-form-item>
          <a-form-item label="默认值:" v-else-if="this.componentData.id === 'rangePicker'">
            <a-range-picker class="width-100-percent" :show-time="this.componentData.field.config.showTime" :format="this.componentData.field.config.format" v-model:value="this.formTarget.fields[this.componentData.name].value" @change="emitUpdateComponentFieldAndForm('value')" />
          </a-form-item>
          <a-form-item label="默认值:" v-else-if="this.componentData.id === 'timePicker'">
            <a-time-picker class="width-100-percent" :show-time="this.componentData.field.config.showTime" :format="this.componentData.field.config.format" v-model:value="this.formTarget.fields[this.componentData.name].value" @change="emitUpdateComponentFieldAndForm('value')" />
          </a-form-item>
          <a-form-item label="默认值:" v-else>
            <a-input v-model:value="this.formTarget.fields[this.componentData.name].value" @change="emitUpdateComponentFieldAndForm('value')" />
          </a-form-item>
          <a-form-item label="模型:" v-if="this.componentData.id === 'selectBox'">
            <a-select v-model:value="this.componentData.field.mode.value" :options="this.componentData.field.mode.options" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="数值进度:" v-if="this.componentData.id === 'numberInput'">
            <a-input v-model:value="this.componentData.field.config.precision" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="选择时出现时间:" v-if="this.componentData.id === 'datePicker' || this.componentData.id === 'rangePicker'">
            <a-switch v-model:checked="this.componentData.field.config.showTime" @change="datePickerShowTimeChange" />
          </a-form-item>
          <a-form-item label="格式化信息:" v-if="this.componentData.field.config.showTime">
            <a-input v-model:value="this.componentData.field.config.format" @change="componentChange()" />
          </a-form-item>
          <a-form-item label="占位提示:" v-if="this.componentData.field.config.placeholder">
            <a-input v-model:value="this.componentData.field.config.placeholder" @change="componentChange()" />
          </a-form-item>
          <a-form-item label="描述:">
            <a-input v-model:value="this.formTarget.fields[this.componentData.name].description" @change="emitUpdateComponentFieldAndForm('description')"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="dataSource" header="数据源" v-if="this.componentData.field.dataSourceConfig">
        <a-form ref="data-source-table-form" layout="vertical">
          <a-form-item label="数据类型:">
            <a-select v-model:value="this.componentData.field.dataSourceConfig.dataType.value" :options="this.componentData.field.dataSourceConfig.dataType.options" @change="(value) => {if (value === 'custom') { this.componentData.field.dataSourceConfig.remoteUrl = undefined}}"/>
          </a-form-item>
          <template v-if="this.componentData.field.dataSourceConfig.dataType.value === 'custom'">
            <a-table size="small" class="ant-table-striped" :scroll="{ x: this.componentData.field.dataSourceConfig.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.componentData.field.config[this.componentData.field.dataSourceConfig.map]" :columns="this.componentData.field.dataSourceConfig.columns" bordered>
              <template #title>自定义数据信息</template>
              <template #bodyCell="{ column, text, record }">
                <template v-if="!['operation'].includes(column.dataIndex)">
                  <a-form-item v-if="this.componentData.field.dataSourceConfig.editableData[record.id]" :name="record.id + '.' + this.componentData.field.dataSourceConfig.editableData[record.id][column.dataIndex]">
                    <a-input v-model:value="this.componentData.field.dataSourceConfig.editableData[record.id][column.dataIndex]"/>
                  </a-form-item>
                  <template v-else>
                    <span :title="text">{{ text }}</span>
                  </template>
                </template>
                <template v-else-if="column.dataIndex === 'operation'">
                  <div class="editable-row-operations text-center">
                    <span v-if="this.componentData.field.dataSourceConfig.editableData[record.id]">
                      <a-space>
                        <a-button size="small" @click="delete this.componentData.field.dataSourceConfig.editableData[record.id]">
                          <icon-font class="icon" type="icon-select" />
                        </a-button>
                        <a-button size="small" danger @click="this.confirm('确定取消当前编辑吗?', () => deleteFieldDataSourceConfigEditable(record.id))">
                          <icon-font class="icon" type="icon-ashbin" />
                        </a-button>
                      </a-space>
                    </span>
                    <template v-else>
                      <a-space>
                      <a-button size="small" type="text" v-if="this.componentData.field.dataSourceConfig.leaf" @click="addDataSourceData(record)">
                          <icon-font class="icon" type="icon-tree-table" />
                        </a-button>
                        <a-button size="small" @click="() => this.componentData.field.dataSourceConfig.editableData[record.id] = record">
                          <icon-font class="icon" type="icon-edit" />
                        </a-button>
                        <a-button size="small" @click="deleteDataSourceData(record)">
                          <a-typography-text type="danger"><icon-font class="icon" type="icon-ashbin" /></a-typography-text>
                        </a-button>
                      </a-space>
                    </template>
                  </div>
                </template>
              </template>
            </a-table>
            <a-button block @click="addDataSourceData()" class="margin-xs-top">
              <icon-font class="icon" type="icon-add"/>
              <span class="hidden-xs hidden-sm hidden-md">添加</span>
            </a-button>
          </template>
          <template v-if="this.componentData.field.dataSourceConfig.dataType.value === 'remote'">
            <a-form-item>
              <template #label>
                远程数据链接:
              </template>
              <a-input v-model:value="this.componentData.field.dataSourceConfig.remoteUrl"/>
            </a-form-item>
          </template>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="event" header="事件" v-if="this.componentData.field.event && this.componentData.field.event.dataSource.length > 0">
        <a-form ref="data-source-table-form">
          <a-table size="small" class="ant-table-striped" :scroll="{ x: this.componentData.field.event.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.componentData.field.event.dataSource" :columns="this.componentData.field.event.columns" bordered>
            <template #title>formily 事件</template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'hasValue'">
                <span :title="record.hasValue ? '已绑定' : '未绑定'">{{ record.hasValue ? '已绑定' : '未绑定' }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations text-center">
                  <a @click="editEventFunctionValue(record)">
                    <icon-font class="icon" type="icon-edit" />
                  </a>
                  <a v-if="record.hasValue" @click="this.confirm('确定删除函数内容吗?', () => deleteEventFunctionValue(record))">
                    <a-typography-text type="danger">
                      <icon-font class="icon" type="icon-ashbin" />
                    </a-typography-text>
                  </a>
                </div>
              </template>
            </template>
          </a-table>
          <a-table size="small" v-if="this.componentData.field.componentEvent" class="ant-table-striped margin-md-top" :scroll="{ x: this.componentData.field.event.columns.reduce((sum, c) => sum + c.width, 0) }" :pagination="false" :data-source="this.componentData.field.componentEvent.dataSource" :columns="this.componentData.field.event.columns" bordered>
            <template #title>控件事件</template>
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'hasValue'">
                <span :title="record.hasValue ? '已绑定' : '未绑定'">{{ record.hasValue ? '已绑定' : '未绑定' }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations text-center">
                  <a-space>
                    <a @click="editEventFunctionValue(record)">
                      <icon-font class="icon" type="icon-edit" />
                    </a>
                    <a @click="this.confirm('确定删除函数内容吗?', () => deleteEventFunctionValue(record))" v-if="record.hasValue">
                      <a-typography-text type="danger">
                        <icon-font class="icon" type="icon-ashbin" />
                      </a-typography-text>
                    </a>
                  </a-space>
                </div>
              </template>
            </template>
          </a-table>
        </a-form>
        <a-modal v-model:visible="this.componentData.field.event.model.visible" :title="'编辑 [' + this.componentData.title + '] 的 ' + this.componentData.field.event.model.record.name + ' 事件'" @ok="buildEvent(this.componentData.field.event.model.record)">
          <a-textarea v-model:value="this.componentData.field.event.model.record.functionValue" placeholder="请输入函数执行过程" :auto-size="{ minRows: 5, maxRows: 10 }"/>
        </a-modal>
      </a-collapse-panel>
      <a-collapse-panel key="other" header="其他" v-if="this.componentData.field.type === 'field'">
        <a-form layout="vertical">
          <a-form-item label="是否禁用:" v-if="this.componentData.field.type === 'field'">
            <a-switch v-model:checked="this.componentData.field.config.disabled" :disabled="this.componentData.field.config.readOnly" @change="this.componentChange()"/>
          </a-form-item>
          <a-form-item label="是否只读:" v-if="this.componentData.field.type === 'field'">
            <a-switch v-model:checked="this.componentData.field.config.readOnly" :disabled="this.componentData.field.config.disabled" @change="this.componentChange()"/>
          </a-form-item>
          <a-form-item label="是否必填:" v-if="this.componentData.field.type === 'field'">
            <a-switch v-model:checked="this.formTarget.fields[this.componentData.name].required" @change="this.emitUpdateComponentFieldAndForm('required')" />
          </a-form-item>
          <a-form-item label="前缀标签:" v-if="this.componentData.id === 'input' || this.componentData.id === 'numberInput'">
            <a-input v-model:value="this.componentData.field.config.addonBefore" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="后缀标签:" v-if="this.componentData.id === 'input' || this.componentData.id === 'numberInput'">
            <a-input v-model:value="this.componentData.field.config.addonAfter" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="前缀文本:" v-if="this.componentData.id === 'numberInput'">
            <a-input v-model:value="this.componentData.field.config.prefix" @change="componentChange()"/>
          </a-form-item>
          <a-form-item label="最小值:" v-if="this.componentData.id === 'numberInput'">
            <a-input-number v-model:value="this.componentData.field.config.min" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
          <a-form-item label="最大值:" v-if="this.componentData.id === 'numberInput'">
            <a-input-number v-model:value="this.componentData.field.config.max" @change="componentChange()" class="width-100-percent"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
    </a-collapse>
  </template>
  <template v-else>
    <a-divider class="font-size">
      <icon-font class="icon margin-xs-right" type="icon-form" />
      <span class="hidden-xs hidden-sm hidden-md">表单属性</span>
    </a-divider>

    <a-form layout="vertical" class="padding-md">
      <a-form-item label="隐藏所有表单项的必选标记:">
        <a-switch v-model:checked="this.formData.hideRequiredMark" @change="formChange()" />
      </a-form-item>
      <a-form-item label="标签的文本换行:">
        <a-switch v-model:checked="this.formData.labelWrap" @change="formChange()"/>
      </a-form-item>
      <a-form-item label="布局方式:">
        <a-select v-model:value="this.formData.layout" :options="this.options.formLayout" @change="formChange()"/>
      </a-form-item>
      <a-form-item label="配置 Form.Item 的 colon 的默认值:" v-if="this.formData.layout === 'horizontal'">
        <a-switch v-model:checked="this.formData.colon" @change="formChange()"/>
      </a-form-item>
      <a-form-item label="无样式:">
        <a-switch v-model:checked="this.formData.noStyle" @change="formChange()"/>
      </a-form-item>
      <a-form-item label="提交失败自动滚动到第一个错误字段:">
        <a-switch v-model:checked="this.formData.scrollToFirstError" @change="formChange()"/>
      </a-form-item>
      <a-form-item label="改变后立即触发一次验证:">
        <a-switch v-model:checked="this.formData.validateOnRuleChange" @change="formChange()"/>
      </a-form-item>
    </a-form>
  </template>

</template>

<script>

import {createForm} from "@formily/core";

export default {
  name: "FormDesignerPropertiesPanel",
  props:{
    component:{
      type:Object
    },
    target:{
      type:Object,
      default() {
        return createForm({ validateFirst: true})
      }
    },
    form:{
      type:Object,
      default() {
        return {
          form:undefined,
          colon:true,
          hideRequiredMark:false,
          labelWrap:false,
          layout:"horizontal",
          noStyle:false,
          scrollToFirstError:false,
          validateOnRuleChange:true
        }
      }
    }
  },
  emits: [
    "update:form",
    "update:target",
    "update:component",
    "componentChange",
    "formChange"
  ],
  watch:{
    component:{
      deep:true,
      handler (newValue) {
        this.componentData = newValue;
      }
    }
  },
  methods:{
    deleteFieldDataSourceConfigEditable(id) {
      delete this.componentData.field.dataSourceConfig.editableData[id];
    },
    formChange() {
      this.$emit('update:form', this.formData);
      this.$emit('update:target', this.formTarget);
      this.$emit('formChange', this.formData, this.formTarget);
    },
    componentChange() {
      this.$emit("update:component", this.componentData);
      this.$emit("componentChange", this.componentData);
    },
    gridRowGutterChange(value, option) {
      this.componentData.field.config.row.gutter.value = option.defaultValue;
      this.componentChange();
    },
    editEventFunctionValue(record) {
      this.componentData.field.event.model.visible = true;
      this.componentData.field.event.model.record = record;
      this.componentChange();
    },
    deleteEventFunctionValue(record) {
      record.functionValue = "";
      this.buildEvent(record);
    },
    buildEvent(record) {
      this.componentData.field.event.model.visible = false;
      record.hasValue = record.functionValue !== null && record.functionValue !== '';
      this.componentChange();
    },
    addDataSourceData(parent) {
      let columns = this.componentData.field.dataSourceConfig.columns.filter(c => c.dataIndex !== 'operation');
      let obj = {id:"gen" + this.$dayjs().unix()};
      // 点太快不给添加
      if (this.componentData.field.config[this.componentData.field.dataSourceConfig.map].filter(o => o.id === obj.id).length > 0) {
        return;
      }
      columns.forEach(c => obj[c.dataIndex] = '');
      if (parent) {
        parent.children = [];
        obj.parent = parent.id;
        parent.children.push(obj);
      } else {
        this.componentData.field.config[this.componentData.field.dataSourceConfig.map].push(obj);
      }
      this.componentData.field.dataSourceConfig.editableData[obj.id] = obj;
      this.componentChange()
    },
    deleteDataSourceData(record) {
      let dataSource = this.componentData.field.config[this.componentData.field.dataSourceConfig.map];
      this.recursionDeleteDataSourceData(dataSource, record);
    },
    recursionDeleteDataSourceData(dataSource, record) {
      let r = dataSource.find(d => d.id === record.id);
      if (r) {
        let index = dataSource.indexOf(r);
        dataSource.splice(index, 1);
        return true;
      }

      let childrenData = dataSource.filter(d => d.children && d.children.length > 0);
      for (let i = 0; i < childrenData.length; i++) {
        let data = childrenData[i];
        let result = this.recursionDeleteDataSourceData(data.children, record);
        if (result) {
          if (data.children.length <= 0) {
            delete data.children;
          }
          return ;
        }
      }
    },
    emitUpdateComponentAndForm(field) {
      this.componentData[field] = this.formTarget.fields[this.componentData.name][field];
      this.componentChange();
      this.formChange();
    },
    emitUpdateComponentFieldAndForm(field) {
      this.componentData.field[field] = this.formTarget.fields[this.componentData.name][field];
      this.componentChange();
      this.formChange();
    },
    datePickerShowTimeChange(checked) {
      if (checked) {
        this.componentData.field.config.format = process.env.VUE_APP_POST_DATETIME_FORMAT
      } else {
        this.componentData.field.config.format = process.env.VUE_APP_POST_DATE_FORMAT
      }
      this.componentChange();
    }
  },
  data() {
    return {
      options:{
        formLayout:[{label:"水平对齐", value:"horizontal"},{label:"垂直对齐", value:"vertical"},{label:"内联对齐", value:"inline"}]
      },
      componentData:this.component,
      formData:this.form,
      formTarget:this.target
    }
  }
}
</script>