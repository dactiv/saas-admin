<template>
  <a-tabs>

    <a-tab-pane key="approve-table">
      <template #tab>
        <icon-font class="icon" type="icon-group" />
        <span class="hidden-xs hidden-sm hidden-md">默认审批人</span>
      </template>

      <a-row justify="start" :gutter="[0,24]">
        <a-col v-for="person of this.participantList.filter(p => p.type.value === 10)" :key="person.userId" :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" >
          <a-card :title="person.username" size="small" :style="{width:'110px'}">
            <template #extra v-if="!this.disabled">
              <a @click="this.confirm('确定删除' + person.username + '审核人吗?',() => removeParticipant(person))">
                <a-typography-text type="danger">移除</a-typography-text>
              </a>
            </template>
            <div class="text-center">
              <a-image :width="64" :height="64" :src="'/api/resources/avatar/get?filename=' + person.userType + '/' + person.userId + '/current&date=' + this.$dayjs().unix()" />
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" v-if="!this.disabled">
          <a-card @click="addParticipant(10)" :style="{width:'110px'}" size="small" hoverable class="grey-background border-dashed border-radius text-center" >
            <a-typography-title :level="1">
              <icon-font type="icon-add" />
            </a-typography-title>
            <p>添加审批人</p>
          </a-card>
        </a-col>
      </a-row>

    </a-tab-pane>

    <a-tab-pane key="copy-table" forceRender>
      <template #tab>
        <icon-font class="icon" type="icon-send" />
        <span class="hidden-xs hidden-sm hidden-md">默认抄送人</span>
      </template>

      <a-row justify="start" :gutter="[0,24]">
        <a-col v-for="person of this.participantList.filter(p => p.type.value === 20)" :key="person.userId" :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" >
          <a-card :title="person.username" size="small" :style="{width:'110px'}">
            <template #extra v-if="!this.disabled">
              <a @click="this.confirm('确定删除' + person.username + '抄送人吗?',() => removeParticipant(person))">
                <a-typography-text type="danger">移除</a-typography-text>
              </a>
            </template>
            <div class="text-center">
              <a-image :width="64" :height="64" :src="'/api/resources/avatar/get?filename=' + person.userType + '/' + person.userId + '/current&date=' + this.$dayjs().unix()" />
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4" :xxl="4" v-if="!this.disabled" >
          <a-card @click="addParticipant(20)" :style="{width:'110px'}" size="small" hoverable class="grey-background border-dashed border-radius text-center" >
            <a-typography-title :level="1">
              <icon-font type="icon-add" />
            </a-typography-title>
            <p>添加抄送人</p>
          </a-card>
        </a-col>
      </a-row>
    </a-tab-pane>

  </a-tabs>

  <a-modal v-model:visible="this.dialogVisibleValue" class="width-md" title="审核参与者信息" @ok="selectedParticipant()" layout="vertical">
    <a-input v-model:value="this.searchText" @pressEnter="this.$refs['department-table'].filterData()" placeholder="请输入名称进行查询" class="margin-lg-bottom">
      <template #addonAfter>
        <a-button type="text" size="small" @click="this.$refs['department-table'].filterData()" :loading="this.loading">
          <icon-font class="icon" v-if="!this.loading" type="icon-search" />
          <span class="hidden-xs hidden-sm hidden-md">搜索</span>
        </a-button>
      </template>
    </a-input>
    <department-table ref="audit-department-table" :scroll="{x:715, y:300}" :checkbox-props="getParticipantCheckboxProps" :search-text="this.searchText" :searchData="{mergeTree:true, loadUser:true}" :created-search="true" v-model:selected-ids="this.selectedParticipantIds"/>
  </a-modal>

</template>

<script>

import DepartmentTable from "@/components/authentication/DepartmentTable";
export default {
  name: "WorkflowApprovedTab",
  components:{DepartmentTable},
  watch: {
    dialogVisible:{
      deep:false,
      handler(newValue) {
        this.dialogVisibleValue = newValue;
      },
    },
    participantList:{
      deep:true,
      handler(newValue) {
        this.participantListValue = newValue;
        this.selectedParticipantIds = this
            .participantListValue
            .filter(p => p.type.value === this.type)
            .map(p => "person-" + p.userId)
            .sort((a,b) => a.sort - b.sort);
      }
    }
  },
  emits: ["update:dialogVisible", "update:participantList"],
  props:{
    participantList:{
      type:Array,
      default() {
        return [];
      }
    },
    disabled:{
      type:Boolean,
      default() {
        return false;
      }
    },
    dialogVisible:{
      type:Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    return {
      searchText:"",
      dialogVisibleValue:this.dialogVisible,
      participantListValue:this.participantList,
      selectedParticipantIds:[],
      type:10,
    }
  },
  methods: {
    getParticipantCheckboxProps(r) {
      return {disabled:r.recordType === 'department'}
    },
    selectedParticipant() {
      let typePerson = this.participantListValue.filter(p => p.type.value === this.type);

      typePerson.forEach(p => this.removeParticipant(p));

      let participant = this.getDepartmentPerson("audit-department-table", this.type);

      this.participantListValue.push(...participant);
      this.$emit("update:participantList", this.participantListValue);

      this.dialogVisibleValue = false;
      this.$emit("update:dialogVisible", this.dialogVisibleValue);
    },
    getDepartmentPerson(ref, type) {
      let personRecords = this.$refs[ref].getSelectedPersonRecords();

      let result = [];
      for (let i = 0; i < personRecords.length; i++ ) {
        let r = personRecords[i];
        let person = {
          userId:r.userId,
          username:r.username,
          userType:r.userType,
          sort:i,
          type: {
            value:type
          }
        }
        result.push(person);
      }

      return result;
    },
    removeParticipant(person) {
      let index = this.participantListValue.indexOf(person);
      this.participantListValue.splice(index, 1);
      this.$emit("update:participantList", this.participantListValue);
    },
    getPersonCheckboxProps(r) {
      return {disabled:r.recordType === 'department'}
    },
    addParticipant(type) {
      this.type = type;
      this.dialogVisibleValue = true;
      this.$emit("update:dialogVisible", this.dialogVisibleValue);
      this.selectedParticipantIds = this
          .participantListValue
          .filter(p => p.type.value === this.type)
          .map(p => "person-" + p.userId)
          .sort((a,b) => a.sort - b.sort);
    },
  }
}
</script>