<template>
  <div class="app-container" style="width: 1000px; margin: 0 auto;">

    <!-- 选择器 -->
    <el-select v-model="requestsType" class="filter-item" @change="handleFilter">
      <el-option v-for="item in requestsTypeOptions" :key="item.key" :label="item.label" :value="item.key"/>
    </el-select>
    
    <!-- 申请列表 -->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      fit
      highlight-current-row
      style="width: 100%;"
      @row-click="handleRowClick">
      <el-table-column label="申请编号" align="center" width="300px">
        <template slot-scope="scope">
          <span>{{ scope.row.TransactionId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请日期" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.DateRequest }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态 / 操作" class-name="status-col" width="300px">
        <template slot-scope="scope">
          <template v-if="scope.row.CheckState=='Resolved'">
            <el-button v-if="scope.row.TxType=='InboundRequest'" type="success" size="mini" @click.stop="checkOrRegister(scope.row, 'registerInbound')">入库登记</el-button>
            <el-button v-if="scope.row.TxType=='OutboundRequest'" type="success" size="mini" @click.stop="checkOrRegister(scope.row, 'registerOutbound')">出库登记</el-button>
          </template>
          <template v-else-if="scope.row.CheckState=='Checking'">
            <el-button type="danger" size="mini" @click.stop="checkOrRegister(scope.row, 'check'+scope.row.TxType, 'Rejected')">拒绝{{ scope.row.TxType | TxType2CHFilter }}</el-button>
            <el-button type="success" size="mini" @click.stop="checkOrRegister(scope.row, 'check'+scope.row.TxType, 'Resolved')">批准{{ scope.row.TxType | TxType2CHFilter }}</el-button>
          </template>
          <el-tag v-else :type="scope.row.CheckState | appStatus2ColorFilter">{{ scope.row.TxType | TxType2CHFilter }}{{ scope.row.CheckState | CheckState2CHFilter }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
    
    <!-- 弹出对话框 -->
    <el-dialog
      :visible.sync="dialogVisible">
      <!--  -->

      <div style="width: 600px; margin: 20px auto">
        
        <el-form :model="ruleForm" ref="ruleForm" label-width="100px" label-position="right">
          <div style="display: flex; justify-content: center;">
            <!--  -->
            <div v-if="ruleForm.CheckState == 'Checking'">
              <h1><i class="el-icon-time"></i> {{ ruleForm.TxType | TxType2CHFilter }}申请待审核</h1>
            </div>
            <!--  -->
            <div v-if="ruleForm.CheckState == 'Rejected'" style="display: flex; align-items: center;">
              <h1><i class="el-icon-circle-close-outline"></i> 已拒绝{{ ruleForm.TxType | TxType2CHFilter }}申请</h1>
              <h2>&nbsp;&nbsp;{{ ruleForm.Description }}</h2>
            </div>
            <div v-if="ruleForm.CheckState == 'Resolved'">
              <h1><i class="el-icon-circle-check-outline"></i> 已批准{{ ruleForm.TxType | TxType2CHFilter }}申请，待{{ ruleForm.TxType | TxType2CHFilter }}登记</h1>
            </div>
            <div v-if="ruleForm.CheckState == 'Finished'">            
              <h1><i class="el-icon-circle-check-outline"></i> 已完成{{ ruleForm.TxType | TxType2CHFilter }}登记</h1>
            </div>
          </div>
          <!--  -->
          <!-- <el-row> -->
            <!-- <el-col :span="12"> -->
              <el-form-item label="申请编号">
                <span>{{ ruleForm.TransactionId }} </span>
              </el-form-item>
            <!-- </el-col> -->
            <el-row>
              <el-col :span="12">
                <el-form-item label="申请日期">
                  <span>{{ ruleForm.DateRequest }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item v-if="ruleForm.CheckState != 'Checking' && ruleForm.CheckState != 'Resolved'" label="审核日期">
                  <span>{{ ruleForm.DateCheck }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          <!-- </el-row> -->
        </el-form>

        <!-- 申请表详情 -->
        <el-form :model="ruleForm" ref="ruleForm" label-width="100px" label-position="right">
          <div style="height: 50px"></div>
          <el-form-item label="申请人信息">
            <el-row>
              <el-col :span="12">
                <el-form-item label="会员名称">
                  <span>{{ ruleForm.MemberName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="会员ID">
                  <span>{{ ruleForm.MemberId }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人">
                  <span>{{ ruleForm.name }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话">
                  <span>{{ ruleForm.phone }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <!--  -->
          <el-form-item label="客户信息">
            <el-row>
              <el-col :span="12">
                <el-form-item label="客户ID">
                  <span>{{ ruleForm.clientID }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称">
                  <span>{{ ruleForm.clientCompany }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="客户联系人">
                  <span>{{ ruleForm.clientName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="客户电话">
                  <span>{{ ruleForm.clientPhone }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <!--  -->
          <el-form-item v-if="ruleForm.TxType!='OutboundRequest'" label="货物信息">
            <el-row>
              <el-col :span="12">
                <el-form-item label="品种代号">
                  <span>{{ ruleForm.goodsVariety }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数量">
                  <span>{{ ruleForm.goodsQuantity }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="品级">
                  <span>{{ ruleForm.goodsLevel }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产地">
                  <span>{{ ruleForm.goodsRegion }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="运输方式">
                  <span>{{ ruleForm.goodsTransport }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生产日期">
                  <span>{{ ruleForm.goodsProduceDate }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="有效期至">
                  <span>{{ ruleForm.goodsValidityPeriod }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="品牌">
                  <span>{{ ruleForm.goodsBand }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="货物包装">
                  <span>{{ ruleForm.goodsPack }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="货物规格">
                  <span>{{ ruleForm.goodsRank }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <!--  -->
          <el-form-item label="仓库信息">
            <el-row>
              <el-col :span="24">
                <el-form-item label="仓库ID">
                  <span>{{ ruleForm.warehouseID }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="拟入库时间">
                  <span>{{ ruleForm.inboundPlanTime }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <!--  -->
          <el-form-item v-if="ruleForm.CheckState=='Finished'" label="登记信息">
            <el-row>
              <el-col :span="12">
                <el-form-item label="登记人">
                  <span>{{ ruleForm.WarehouseReceipts[0].Signer }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="登记地">
                  <span>{{ ruleForm.WarehouseReceipts[0].SignPlace }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="登记日期">
                  <span>{{ ruleForm.WarehouseReceipts[0].SignDate }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="仓储开始日期">
                  <span>{{ ruleForm.WarehouseReceipts[0].StoragePeriod.StartDate }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="仓储结束日期">
                  <span>{{ ruleForm.WarehouseReceipts[0].StoragePeriod.EndDate }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="仓储地址">
                  <span>{{ ruleForm.WarehouseReceipts[0].StoragePlace.Address }}</span>
                </el-form-item>
              </el-col>
              </el-row>
              <el-row>
              <el-col :span="24">
                <el-form-item label="库位编号">
                  <span>{{ ruleForm.WarehouseReceipts[0].StoragePlace.Location }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="入库日期">
                  <span>{{ ruleForm.DateIndeed }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </div>

    </el-dialog>
    
    <!--  -->
    <el-dialog
      :before-close="handleClose"
      :visible.sync="checkOrRegisterVisible">

      <div style="width: 600px; margin: 20px auto">
        <!-- 第1步骤 -->
        <el-form :model="ruleForm" label-width="100px" label-position="left">
          <el-card v-if="ruleForm.TxType!='OutboundRequest'">
            <el-form-item label="货物信息">
              <el-row>
                <el-col :span="6">
                  <el-form-item prop="goodsVariety">
                    <md-input v-model="ruleForm.goodsVariety">品种代号</md-input>
                  </el-form-item>
                </el-col>
                <el-col :span="3">&nbsp;</el-col>
                <el-col :span="6">
                  <el-form-item prop="goodsQuantity">
                    <md-input v-model="ruleForm.goodsQuantity">数量</md-input>
                  </el-form-item>
                </el-col>
                <el-col :span="3">&nbsp;</el-col>
                <el-col :span="6">
                  <el-form-item prop="goodsLevel">
                    <md-input v-model="ruleForm.goodsLevel">品级</md-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <!--  -->
              <el-row>
                <el-col :span="11">
                  <el-form-item prop="goodsRegion">
                    <md-input v-model="ruleForm.goodsRegion">产地</md-input>
                  </el-form-item>
                </el-col>
                <el-col :span="3">&nbsp;</el-col>
                <el-col :span="10">
                  <el-form-item prop="goodsTransport">
                    <md-input v-model="ruleForm.goodsTransport">运输方式</md-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <!--  -->
              <el-form-item prop="goodsProduceDate">
                <md-input v-model="ruleForm.goodsProduceDate">生产日期</md-input>
              </el-form-item>
              <!--  -->
              <el-form-item prop="goodsValidityPeriod">
                <md-input v-model="ruleForm.goodsValidityPeriod">有效期至</md-input>
              </el-form-item>
              <!--  -->
              <el-form-item prop="goodsBand">
                <md-input v-model="ruleForm.goodsBand">品牌</md-input>
              </el-form-item>
              <!--  -->
              <el-form-item prop="goodsPack">
                <md-input v-model="ruleForm.goodsPack">货物包装</md-input>
              </el-form-item>
              <!--  -->
              <el-form-item prop="goodsRank">
                <md-input v-model="ruleForm.goodsRank">货物规格</md-input>
              </el-form-item>
            </el-form-item>
          </el-card>
          <!-- checkInboundRequest || checkOutboundRequest -->
          <div v-if="fcn=='checkInboundRequest'||fcn=='checkOutboundRequest'">
            <el-form-item prop="DatePermitted">
              <md-input v-model="ruleForm.DatePermitted">{{ ruleForm.TxType | TxType2CHFilter  }}期限</md-input>
            </el-form-item>
            <el-form-item prop="Description">
              <md-input v-model="ruleForm.Description">说明</md-input>
            </el-form-item>
          </div>
          <!-- registerInbound -->
          <div v-if="fcn=='registerInbound'">
            <el-form-item prop="Signer">
              <md-input v-model="ruleForm.Signer">登记人</md-input>
            </el-form-item>
             <el-form-item prop="SignPlace">
              <md-input v-model="ruleForm.SignPlace">登记地</md-input>
            </el-form-item>
            <el-form-item prop="SignDate">
              <md-input v-model="ruleForm.SignDate">登记日期</md-input>
            </el-form-item>
            <el-form-item prop="StartDate">
              <md-input v-model="ruleForm.StartDate">仓储开始日期</md-input>
            </el-form-item>
             <el-form-item prop="EndDate">
              <md-input v-model="ruleForm.EndDate">仓储结束日期</md-input>
            </el-form-item>
            <el-form-item prop="Address">
              <md-input v-model="ruleForm.Address">仓储地址</md-input>
            </el-form-item>
            <el-form-item prop="Location">
              <md-input v-model="ruleForm.Location">库位编号</md-input>
            </el-form-item>
          </div>
          <!-- registerInbound || registerOutbound -->
          <el-form-item v-if="fcn=='registerInbound'||fcn=='registerOutbound'" prop="DateIndeed">
            <md-input v-model="ruleForm.DateIndeed">{{ ruleForm.TxType | TxType2CHFilter }}日期</md-input>
          </el-form-item>
        </el-form>

      </div>
        
        <span slot="footer">
          <!-- checkInboundRequest || checkOutboundRequest -->
          <div v-if="fcn=='checkInboundRequest'||fcn=='checkOutboundRequest'">
            <el-button v-if="ruleForm.CheckState=='Resolved'" type="success" :loading="ruleFormLoading" @click="submitForm">批准{{ ruleForm.TxType | TxType2CHFilter }}</el-button>
            <el-button v-if="ruleForm.CheckState=='Rejected'" type="danger" :loading="ruleFormLoading" @click="submitForm">拒绝{{ ruleForm.TxType | TxType2CHFilter }}</el-button>
          </div>
          <!-- registerInbound || registerOutbound -->
          <el-button v-if="fcn=='registerInbound'||fcn=='registerOutbound'" type="success" :loading="ruleFormLoading" @click="submitForm">登记{{ ruleForm.TxType | TxType2CHFilter }}</el-button>
        </span>

    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from "@/utils";
import MdInput from "@/components/MDinput";
import { queryTable, frontToBackReceipt } from "@/api/utils";
import { storageRequest } from "@/api/storage";
import { Message } from "element-ui";
import { backToFrontReceipt } from "@/utils/conversion";

export default {
  name: "ApplicationForm",
  directives: {},
  components: {
    MdInput
  },
  filters: {},
  data() {
    return {
      total: 0,
      tableKey: 0,
      list: null,
      myRequests: null,
      listLoading: true,
      ruleFormLoading: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      dialogVisible: false,
      checkOrRegisterVisible: false,
      requestsTypeOptions: [
        { label: "全部", key: "*" },
        { label: "入库审核", key: "InboundRequest" },
        { label: "出库审核", key: "OutboundRequest" }
      ],
      requestsType: "*",
      fcn: null,
      ruleForm: {
        Signer: "林一山",
        SignPlace: "河南",
        SignDate: "2018-11-01",
        StartDate: "2018-11-01",
        EndDate: "2019-11-01",
        Address: "河南省郑州市友爱路1号",
        Location: "1A01-04-0"
      }
      // ruleForm: {
      //   name: "",
      //   phone: "",
      //   clientID: "",
      //   clientCompany: "",
      //   clientName: "",
      //   clientPhone: "",
      //   goodsVariety: "",
      //   goodsQuantity: "",
      //   goodsLevel: "",
      //   goodsRegion: "",
      //   goodsTransport: "",
      //   goodsProduceDate: "",
      //   goodsValidityPeriod: "",
      //   goodsBand: "",
      //   goodsPack: "",
      //   goodsRank: "",
      //   warehouseID: "",
      //   inboundPlanTime: ""
      // }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      queryTable("Warehouse", this.requestsType, "queryMyRequests")
        .then(response => {
          var myRequests = [];
          if (response.data.message != "null") {
            const temp = JSON.parse(response.data.message);
            var total = temp.length;
            for (var i = 0; i < total; i++) {
              var request = JSON.parse(temp[i]);
              myRequests[i] = backToFrontReceipt(request);
            }
          }
          this.myRequests = myRequests;
          this.handleCurrentChange(this.listQuery.page);
          this.total = total;
          this.listLoading = false;
        })
        .catch(error => {
          console.log(error);
          this.listLoading = false;
        });
    },
    handleRowClick(a, b, c) {
      this.dialogVisible = true;
      this.ruleForm = Object.assign({}, a);
      console.log(this.ruleForm);
    },
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.handleCurrentChange(1);
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.list = this.myRequests.slice(
        this.listQuery.limit * (this.listQuery.page - 1),
        this.listQuery.limit * (this.listQuery.page - 1) + this.listQuery.limit
      );
    },
    checkOrRegister(row, fcn, CheckState) {
      // for (var k in this.ruleForm) {
      //   this.ruleForm[k] = "";
      // }
      this.ruleForm = Object.assign(this.ruleForm, row);
      if (
        this.fcn == "checkInboundRequest" ||
        this.fcn == "checkOutboundRequest"
      ) {
        this.ruleForm.DatePermitted = this.ruleForm.inboundPlanTime;
        this.ruleForm.CheckState = CheckState;
      } else if (
        this.fcn == "registerInbound" ||
        this.fcn == "registerOutbound"
      ) {
        this.ruleForm.DateIndeed = this.ruleForm.DateInPlan;
      }
      this.fcn = fcn;
      this.checkOrRegisterVisible = true;
    },
    submitForm() {
      var GoodsListRequested = frontToBackReceipt(this.ruleForm)
        .GoodsListRequested;
      if (
        this.fcn == "checkInboundRequest" ||
        this.fcn == "checkOutboundRequest"
      ) {
        this.ruleForm.GoodsListPermitted = GoodsListRequested;
        this.ruleForm.DateCheck = parseTime(new Date(), "{y}-{m}-{d}");
      } else if (this.fcn == "registerInbound") {
        this.ruleForm.GoodsListIndeed = GoodsListRequested;
        this.ruleForm.DateCreate = parseTime(new Date(), "{y}-{m}-{d}");
      } else if (this.fcn == "registerOutbound") {
        this.ruleForm.GoodsIndeed = GoodsListRequested[0];
      }
      this.ruleFormLoading = true;
      console.log(this.ruleForm);
      storageRequest(this.fcn, this.ruleForm)
        .then(response => {
          // console.log(response);
          if (!response.data.success) throw new Error(response.data.message);
          this.ruleFormLoading = false;
          Message.success("提交成功！");
          this.checkOrRegisterVisible = false;
          this.getList();
        })
        .catch(error => {
          this.ruleFormLoading = false;
          Message.error("提交失败！");
        });
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(_ => {
          this.ruleFormLoading = false;
          done();
        })
        .catch(_ => {});
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    }
    // handleNewRequest() {
    //   for (var k in this.ruleForm) {
    //     this.ruleForm[k] = "";
    //   }
    //   this.active = 0;
    //   this.dialogVisible = true;
    // }
  }
};
</script>