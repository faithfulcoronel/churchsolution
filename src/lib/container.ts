import 'reflect-metadata';
import { Container } from 'inversify';
import { MemberAdapter, type IMemberAdapter } from '../adapters/member.adapter';
import {
  NotificationAdapter,
  type INotificationAdapter
} from '../adapters/notification.adapter';
import { AccountAdapter, type IAccountAdapter } from '../adapters/account.adapter';
import {
  FinancialSourceAdapter,
  type IFinancialSourceAdapter
} from '../adapters/financialSource.adapter';
import {
  ChartOfAccountAdapter,
  type IChartOfAccountAdapter
} from '../adapters/chartOfAccount.adapter';
import {
  FinancialTransactionHeaderAdapter,
  type IFinancialTransactionHeaderAdapter
} from '../adapters/financialTransactionHeader.adapter';
import {
  FinancialTransactionAdapter,
  type IFinancialTransactionAdapter
} from '../adapters/financialTransaction.adapter';
import {
  IncomeExpenseTransactionAdapter,
  type IIncomeExpenseTransactionAdapter
} from '../adapters/incomeExpenseTransaction.adapter';
import {
  IncomeExpenseTransactionMappingAdapter,
  type IIncomeExpenseTransactionMappingAdapter
} from '../adapters/incomeExpenseTransactionMapping.adapter';
import { FundAdapter, type IFundAdapter } from '../adapters/fund.adapter';
import { FundBalanceAdapter, type IFundBalanceAdapter } from '../adapters/fundBalance.adapter';
import {
  OfferingBatchAdapter,
  type IOfferingBatchAdapter,
} from '../adapters/offeringBatch.adapter';
import { CategoryAdapter, type ICategoryAdapter } from '../adapters/category.adapter';
import { RoleAdapter, type IRoleAdapter } from '../adapters/role.adapter';
import { PermissionAdapter, type IPermissionAdapter } from '../adapters/permission.adapter';
import { AuthUserAdapter, type IAuthUserAdapter } from '../adapters/authUser.adapter';
import { ErrorLogAdapter, type IErrorLogAdapter } from '../adapters/errorLog.adapter';
import { FinanceDashboardAdapter, type IFinanceDashboardAdapter } from '../adapters/financeDashboard.adapter';
import {
  SourceRecentTransactionAdapter,
  type ISourceRecentTransactionAdapter
} from '../adapters/sourceRecentTransaction.adapter';
import { MemberRepository, type IMemberRepository } from '../repositories/member.repository';
import {
  NotificationRepository,
  type INotificationRepository
} from '../repositories/notification.repository';
import { AccountRepository, type IAccountRepository } from '../repositories/account.repository';
import {
  FinancialSourceRepository,
  type IFinancialSourceRepository
} from '../repositories/financialSource.repository';
import {
  ChartOfAccountRepository,
  type IChartOfAccountRepository
} from '../repositories/chartOfAccount.repository';
import {
  FinancialTransactionHeaderRepository,
  type IFinancialTransactionHeaderRepository
} from '../repositories/financialTransactionHeader.repository';
import {
  FinancialTransactionRepository,
  type IFinancialTransactionRepository
} from '../repositories/financialTransaction.repository';
import {
  IncomeExpenseTransactionRepository,
  type IIncomeExpenseTransactionRepository
} from '../repositories/incomeExpenseTransaction.repository';
import {
  IncomeExpenseTransactionMappingRepository,
  type IIncomeExpenseTransactionMappingRepository
} from '../repositories/incomeExpenseTransactionMapping.repository';
import { FundRepository, type IFundRepository } from '../repositories/fund.repository';
import { FundBalanceRepository, type IFundBalanceRepository } from '../repositories/fundBalance.repository';
import {
  OfferingBatchRepository,
  type IOfferingBatchRepository,
} from '../repositories/offeringBatch.repository';
import { CategoryRepository, type ICategoryRepository } from '../repositories/category.repository';
import { RoleRepository, type IRoleRepository } from '../repositories/role.repository';
import { PermissionRepository, type IPermissionRepository } from '../repositories/permission.repository';
import { UserRepository, type IUserRepository } from '../repositories/user.repository';
import { ErrorLogRepository, type IErrorLogRepository } from '../repositories/errorLog.repository';
import { FinanceDashboardRepository, type IFinanceDashboardRepository } from '../repositories/financeDashboard.repository';
import {
  SourceRecentTransactionRepository,
  type ISourceRecentTransactionRepository
} from '../repositories/sourceRecentTransaction.repository';
import { SupabaseAuditService, type AuditService } from '../services/AuditService';
import { IncomeExpenseTransactionService } from '../services/IncomeExpenseTransactionService';
import { SupabaseErrorLogService, type ErrorLogService } from '../services/ErrorLogService';
import { TYPES } from './types';

const container = new Container();

// Register adapters
container
  .bind<IMemberAdapter>(TYPES.IMemberAdapter)
  .to(MemberAdapter)
  .inSingletonScope();
container
  .bind<INotificationAdapter>(TYPES.INotificationAdapter)
  .to(NotificationAdapter)
  .inSingletonScope();
container
  .bind<IAccountAdapter>(TYPES.IAccountAdapter)
  .to(AccountAdapter)
  .inSingletonScope();
container
  .bind<IFinancialSourceAdapter>(TYPES.IFinancialSourceAdapter)
  .to(FinancialSourceAdapter)
  .inSingletonScope();
container
  .bind<IChartOfAccountAdapter>(TYPES.IChartOfAccountAdapter)
  .to(ChartOfAccountAdapter)
  .inSingletonScope();
container
  .bind<IFinancialTransactionHeaderAdapter>(TYPES.IFinancialTransactionHeaderAdapter)
  .to(FinancialTransactionHeaderAdapter)
  .inSingletonScope();
container
  .bind<IFinancialTransactionAdapter>(TYPES.IFinancialTransactionAdapter)
  .to(FinancialTransactionAdapter)
  .inSingletonScope();
container
  .bind<IIncomeExpenseTransactionAdapter>(TYPES.IIncomeExpenseTransactionAdapter)
  .to(IncomeExpenseTransactionAdapter)
  .inSingletonScope();
container
  .bind<IIncomeExpenseTransactionMappingAdapter>(
    TYPES.IIncomeExpenseTransactionMappingAdapter
  )
  .to(IncomeExpenseTransactionMappingAdapter)
  .inSingletonScope();
container
  .bind<IFundAdapter>(TYPES.IFundAdapter)
  .to(FundAdapter)
  .inSingletonScope();
container
  .bind<IFundBalanceAdapter>(TYPES.IFundBalanceAdapter)
  .to(FundBalanceAdapter)
  .inSingletonScope();
container
  .bind<ICategoryAdapter>(TYPES.ICategoryAdapter)
  .to(CategoryAdapter)
  .inSingletonScope();
container
  .bind<IRoleAdapter>(TYPES.IRoleAdapter)
  .to(RoleAdapter)
  .inSingletonScope();
container
  .bind<IPermissionAdapter>(TYPES.IPermissionAdapter)
  .to(PermissionAdapter)
  .inSingletonScope();
container
  .bind<IOfferingBatchAdapter>(TYPES.IOfferingBatchAdapter)
  .to(OfferingBatchAdapter)
  .inSingletonScope();
container
  .bind<IAuthUserAdapter>(TYPES.IAuthUserAdapter)
  .to(AuthUserAdapter)
  .inSingletonScope();
container
  .bind<IErrorLogAdapter>(TYPES.IErrorLogAdapter)
  .to(ErrorLogAdapter)
  .inSingletonScope();
container
  .bind<IFinanceDashboardAdapter>(TYPES.IFinanceDashboardAdapter)
  .to(FinanceDashboardAdapter)
  .inSingletonScope();
container
  .bind<ISourceRecentTransactionAdapter>(TYPES.ISourceRecentTransactionAdapter)
  .to(SourceRecentTransactionAdapter)
  .inSingletonScope();

// Register services
container
  .bind<AuditService>(TYPES.AuditService)
  .to(SupabaseAuditService)
  .inSingletonScope();
container
  .bind<IncomeExpenseTransactionService>(TYPES.IncomeExpenseTransactionService)
  .to(IncomeExpenseTransactionService)
  .inSingletonScope();
container
  .bind<ErrorLogService>(TYPES.ErrorLogService)
  .to(SupabaseErrorLogService)
  .inSingletonScope();

// Register repositories
container
  .bind<IMemberRepository>(TYPES.IMemberRepository)
  .to(MemberRepository)
  .inSingletonScope();
container
  .bind<INotificationRepository>(TYPES.INotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope();
container
  .bind<IAccountRepository>(TYPES.IAccountRepository)
  .to(AccountRepository)
  .inSingletonScope();
container
  .bind<IFinancialSourceRepository>(TYPES.IFinancialSourceRepository)
  .to(FinancialSourceRepository)
  .inSingletonScope();
container
  .bind<IChartOfAccountRepository>(TYPES.IChartOfAccountRepository)
  .to(ChartOfAccountRepository)
  .inSingletonScope();
container
  .bind<IFinancialTransactionHeaderRepository>(
    TYPES.IFinancialTransactionHeaderRepository
  )
  .to(FinancialTransactionHeaderRepository)
  .inSingletonScope();
container
  .bind<IFundRepository>(TYPES.IFundRepository)
  .to(FundRepository)
  .inSingletonScope();
container
  .bind<IFundBalanceRepository>(TYPES.IFundBalanceRepository)
  .to(FundBalanceRepository)
  .inSingletonScope();
container
  .bind<ICategoryRepository>(TYPES.ICategoryRepository)
  .to(CategoryRepository)
  .inSingletonScope();
container
  .bind<IRoleRepository>(TYPES.IRoleRepository)
  .to(RoleRepository)
  .inSingletonScope();
container
  .bind<IPermissionRepository>(TYPES.IPermissionRepository)
  .to(PermissionRepository)
  .inSingletonScope();
container
  .bind<IFinancialTransactionRepository>(TYPES.IFinancialTransactionRepository)
  .to(FinancialTransactionRepository)
  .inSingletonScope();
container
  .bind<IIncomeExpenseTransactionRepository>(TYPES.IIncomeExpenseTransactionRepository)
  .to(IncomeExpenseTransactionRepository)
  .inSingletonScope();
container
  .bind<IIncomeExpenseTransactionMappingRepository>(
    TYPES.IIncomeExpenseTransactionMappingRepository
  )
  .to(IncomeExpenseTransactionMappingRepository)
  .inSingletonScope();
container
  .bind<IOfferingBatchRepository>(TYPES.IOfferingBatchRepository)
  .to(OfferingBatchRepository)
  .inSingletonScope();
container
  .bind<IUserRepository>(TYPES.IUserRepository)
  .to(UserRepository)
  .inSingletonScope();
container
  .bind<IErrorLogRepository>(TYPES.IErrorLogRepository)
  .to(ErrorLogRepository)
  .inSingletonScope();
container
  .bind<IFinanceDashboardRepository>(TYPES.IFinanceDashboardRepository)
  .to(FinanceDashboardRepository)
  .inSingletonScope();
container
  .bind<ISourceRecentTransactionRepository>(
    TYPES.ISourceRecentTransactionRepository
  )
  .to(SourceRecentTransactionRepository)
  .inSingletonScope();

export { container };
