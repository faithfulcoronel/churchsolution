import 'reflect-metadata';
import { Container } from 'inversify';
import { MemberAdapter, type IMemberAdapter } from '../adapters/member.adapter';
import {
  NotificationAdapter,
  type INotificationAdapter
} from '../adapters/notification.adapter';
import {
  AnnouncementAdapter,
  type IAnnouncementAdapter,
} from '../adapters/announcement.adapter';
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
import { OpeningBalanceAdapter, type IOpeningBalanceAdapter } from '../adapters/openingBalance.adapter';
import { FiscalYearAdapter, type IFiscalYearAdapter } from '../adapters/fiscalYear.adapter';
import { FiscalPeriodAdapter, type IFiscalPeriodAdapter } from '../adapters/fiscalPeriod.adapter';
import {
  OfferingBatchAdapter,
  type IOfferingBatchAdapter,
} from '../adapters/offeringBatch.adapter';
import { CategoryAdapter, type ICategoryAdapter } from '../adapters/category.adapter';
import {
  MembershipTypeAdapter,
  type IMembershipTypeAdapter
} from '../adapters/membershipType.adapter';
import {
  MembershipStatusAdapter,
  type IMembershipStatusAdapter
} from '../adapters/membershipStatus.adapter';
import { RoleAdapter, type IRoleAdapter } from '../adapters/role.adapter';
import { PermissionAdapter, type IPermissionAdapter } from '../adapters/permission.adapter';
import { MenuItemAdapter, type IMenuItemAdapter } from '../adapters/menuItem.adapter';
import { MenuPermissionAdapter, type IMenuPermissionAdapter } from '../adapters/menuPermission.adapter';
import { RoleMenuItemAdapter, type IRoleMenuItemAdapter } from '../adapters/roleMenuItem.adapter';
import { UserRoleAdapter, type IUserRoleAdapter } from '../adapters/userRole.adapter';
import { AuthUserAdapter, type IAuthUserAdapter } from '../adapters/authUser.adapter';
import { ErrorLogAdapter, type IErrorLogAdapter } from '../adapters/errorLog.adapter';
import { ActivityLogAdapter, type IActivityLogAdapter } from '../adapters/activityLog.adapter';
import { FinanceDashboardAdapter, type IFinanceDashboardAdapter } from '../adapters/financeDashboard.adapter';
import {
  SourceRecentTransactionAdapter,
  type ISourceRecentTransactionAdapter
} from '../adapters/sourceRecentTransaction.adapter';
import { MessageThreadAdapter, type IMessageThreadAdapter } from '../adapters/messageThread.adapter';
import { MessageAdapter, type IMessageAdapter } from '../adapters/message.adapter';
import { LicenseAdapter, type ILicenseAdapter } from '../adapters/license.adapter';
import { LicenseFeatureAdapter, type ILicenseFeatureAdapter } from '../adapters/licenseFeature.adapter';
import { TenantAdapter, type ITenantAdapter } from '../adapters/tenant.adapter';
import { LicensePlanAdapter, type ILicensePlanAdapter } from '../adapters/licensePlan.adapter';
import { MemberRepository, type IMemberRepository } from '../repositories/member.repository';
import {
  NotificationRepository,
  type INotificationRepository
} from '../repositories/notification.repository';
import {
  AnnouncementRepository,
  type IAnnouncementRepository
} from '../repositories/announcement.repository';
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
import { OpeningBalanceRepository, type IOpeningBalanceRepository } from '../repositories/openingBalance.repository';
import { FiscalYearRepository, type IFiscalYearRepository } from '../repositories/fiscalYear.repository';
import { FiscalPeriodRepository, type IFiscalPeriodRepository } from '../repositories/fiscalPeriod.repository';
import {
  OfferingBatchRepository,
  type IOfferingBatchRepository,
} from '../repositories/offeringBatch.repository';
import { CategoryRepository, type ICategoryRepository } from '../repositories/category.repository';
import {
  MembershipTypeRepository,
  type IMembershipTypeRepository
} from '../repositories/membershipType.repository';
import {
  MembershipStatusRepository,
  type IMembershipStatusRepository
} from '../repositories/membershipStatus.repository';
import { RoleRepository, type IRoleRepository } from '../repositories/role.repository';
import { PermissionRepository, type IPermissionRepository } from '../repositories/permission.repository';
import { MenuItemRepository, type IMenuItemRepository } from '../repositories/menuItem.repository';
import { MenuPermissionRepository, type IMenuPermissionRepository } from '../repositories/menuPermission.repository';
import { RoleMenuItemRepository, type IRoleMenuItemRepository } from '../repositories/roleMenuItem.repository';
import { UserRoleRepository, type IUserRoleRepository } from '../repositories/userRole.repository';
import { UserRepository, type IUserRepository } from '../repositories/user.repository';
import { ErrorLogRepository, type IErrorLogRepository } from '../repositories/errorLog.repository';
import { ActivityLogRepository, type IActivityLogRepository } from '../repositories/activityLog.repository';
import { FinanceDashboardRepository, type IFinanceDashboardRepository } from '../repositories/financeDashboard.repository';
import {
  SourceRecentTransactionRepository,
  type ISourceRecentTransactionRepository
} from '../repositories/sourceRecentTransaction.repository';
import { MessageThreadRepository, type IMessageThreadRepository } from '../repositories/messageThread.repository';
import { MessageRepository, type IMessageRepository } from '../repositories/message.repository';
import { LicenseRepository, type ILicenseRepository } from '../repositories/license.repository';
import { LicenseFeatureRepository, type ILicenseFeatureRepository } from '../repositories/licenseFeature.repository';
import { TenantRepository, type ITenantRepository } from '../repositories/tenant.repository';
import { LicensePlanRepository, type ILicensePlanRepository } from '../repositories/licensePlan.repository';
import { SettingAdapter, type ISettingAdapter } from '../adapters/setting.adapter';
import { SettingRepository, type ISettingRepository } from '../repositories/setting.repository';
import { SupabaseSettingService, type SettingService } from '../services/SettingService';
import { SupabaseAuditService, type AuditService } from '../services/AuditService';
import { IncomeExpenseTransactionService } from '../services/IncomeExpenseTransactionService';
import { DonationImportService } from '../services/DonationImportService';
import { SupabaseErrorLogService, type ErrorLogService } from '../services/ErrorLogService';
import { SupabaseAnnouncementService, type AnnouncementService } from '../services/AnnouncementService';
import { SupabaseActivityLogService, type ActivityLogService } from '../services/ActivityLogService';
import { UserRoleService } from '../services/UserRoleService';
import { LicenseService } from '../services/LicenseService';
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
  .bind<IAnnouncementAdapter>(TYPES.IAnnouncementAdapter)
  .to(AnnouncementAdapter)
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
  .bind<IOpeningBalanceAdapter>(TYPES.IOpeningBalanceAdapter)
  .to(OpeningBalanceAdapter)
  .inSingletonScope();
container
  .bind<IFiscalYearAdapter>(TYPES.IFiscalYearAdapter)
  .to(FiscalYearAdapter)
  .inSingletonScope();
container
  .bind<IFiscalPeriodAdapter>(TYPES.IFiscalPeriodAdapter)
  .to(FiscalPeriodAdapter)
  .inSingletonScope();
container
  .bind<ICategoryAdapter>(TYPES.ICategoryAdapter)
  .to(CategoryAdapter)
  .inSingletonScope();
container
  .bind<IMembershipTypeAdapter>(TYPES.IMembershipTypeAdapter)
  .to(MembershipTypeAdapter)
  .inSingletonScope();
container
  .bind<IMembershipStatusAdapter>(TYPES.IMembershipStatusAdapter)
  .to(MembershipStatusAdapter)
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
  .bind<IMenuItemAdapter>(TYPES.IMenuItemAdapter)
  .to(MenuItemAdapter)
  .inSingletonScope();
container
  .bind<IMenuPermissionAdapter>(TYPES.IMenuPermissionAdapter)
  .to(MenuPermissionAdapter)
  .inSingletonScope();
container
  .bind<IRoleMenuItemAdapter>(TYPES.IRoleMenuItemAdapter)
  .to(RoleMenuItemAdapter)
  .inSingletonScope();
container
  .bind<IUserRoleAdapter>(TYPES.IUserRoleAdapter)
  .to(UserRoleAdapter)
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
  .bind<IActivityLogAdapter>(TYPES.IActivityLogAdapter)
  .to(ActivityLogAdapter)
  .inSingletonScope();
container
  .bind<IFinanceDashboardAdapter>(TYPES.IFinanceDashboardAdapter)
  .to(FinanceDashboardAdapter)
  .inSingletonScope();
container
  .bind<ISourceRecentTransactionAdapter>(TYPES.ISourceRecentTransactionAdapter)
  .to(SourceRecentTransactionAdapter)
  .inSingletonScope();
container
  .bind<IMessageThreadAdapter>(TYPES.IMessageThreadAdapter)
  .to(MessageThreadAdapter)
  .inSingletonScope();
container
  .bind<IMessageAdapter>(TYPES.IMessageAdapter)
  .to(MessageAdapter)
  .inSingletonScope();
container
  .bind<ISettingAdapter>(TYPES.ISettingAdapter)
  .to(SettingAdapter)
  .inSingletonScope();
container
  .bind<ILicenseAdapter>(TYPES.ILicenseAdapter)
  .to(LicenseAdapter)
  .inSingletonScope();
container
  .bind<ILicenseFeatureAdapter>(TYPES.ILicenseFeatureAdapter)
  .to(LicenseFeatureAdapter)
  .inSingletonScope();
container
  .bind<ITenantAdapter>(TYPES.ITenantAdapter)
  .to(TenantAdapter)
  .inSingletonScope();
container
  .bind<ILicensePlanAdapter>(TYPES.ILicensePlanAdapter)
  .to(LicensePlanAdapter)
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
  .bind<DonationImportService>(TYPES.DonationImportService)
  .to(DonationImportService)
  .inSingletonScope();
container
  .bind<ErrorLogService>(TYPES.ErrorLogService)
  .to(SupabaseErrorLogService)
  .inSingletonScope();
container
  .bind<ActivityLogService>(TYPES.ActivityLogService)
  .to(SupabaseActivityLogService)
  .inSingletonScope();
container
  .bind<AnnouncementService>(TYPES.AnnouncementService)
  .to(SupabaseAnnouncementService)
  .inSingletonScope();
container
  .bind<SettingService>(TYPES.SettingService)
  .to(SupabaseSettingService)
  .inSingletonScope();
container
  .bind<LicenseService>(TYPES.LicenseService)
  .to(LicenseService)
  .inSingletonScope();
container
  .bind<UserRoleService>(TYPES.UserRoleService)
  .to(UserRoleService)
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
  .bind<IAnnouncementRepository>(TYPES.IAnnouncementRepository)
  .to(AnnouncementRepository)
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
  .bind<IOpeningBalanceRepository>(TYPES.IOpeningBalanceRepository)
  .to(OpeningBalanceRepository)
  .inSingletonScope();
container
  .bind<IFiscalYearRepository>(TYPES.IFiscalYearRepository)
  .to(FiscalYearRepository)
  .inSingletonScope();
container
  .bind<IFiscalPeriodRepository>(TYPES.IFiscalPeriodRepository)
  .to(FiscalPeriodRepository)
  .inSingletonScope();
container
  .bind<ICategoryRepository>(TYPES.ICategoryRepository)
  .to(CategoryRepository)
  .inSingletonScope();
container
  .bind<IMembershipTypeRepository>(TYPES.IMembershipTypeRepository)
  .to(MembershipTypeRepository)
  .inSingletonScope();
container
  .bind<IMembershipStatusRepository>(TYPES.IMembershipStatusRepository)
  .to(MembershipStatusRepository)
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
  .bind<IMenuItemRepository>(TYPES.IMenuItemRepository)
  .to(MenuItemRepository)
  .inSingletonScope();
container
  .bind<IMenuPermissionRepository>(TYPES.IMenuPermissionRepository)
  .to(MenuPermissionRepository)
  .inSingletonScope();
container
  .bind<IRoleMenuItemRepository>(TYPES.IRoleMenuItemRepository)
  .to(RoleMenuItemRepository)
  .inSingletonScope();
container
  .bind<IUserRoleRepository>(TYPES.IUserRoleRepository)
  .to(UserRoleRepository)
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
  .bind<IActivityLogRepository>(TYPES.IActivityLogRepository)
  .to(ActivityLogRepository)
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
container
  .bind<IMessageThreadRepository>(TYPES.IMessageThreadRepository)
  .to(MessageThreadRepository)
  .inSingletonScope();
container
  .bind<IMessageRepository>(TYPES.IMessageRepository)
  .to(MessageRepository)
  .inSingletonScope();
container
  .bind<ILicenseRepository>(TYPES.ILicenseRepository)
  .to(LicenseRepository)
  .inSingletonScope();
container
  .bind<ILicenseFeatureRepository>(TYPES.ILicenseFeatureRepository)
  .to(LicenseFeatureRepository)
  .inSingletonScope();
container
  .bind<ITenantRepository>(TYPES.ITenantRepository)
  .to(TenantRepository)
  .inSingletonScope();
container
  .bind<ILicensePlanRepository>(TYPES.ILicensePlanRepository)
  .to(LicensePlanRepository)
  .inSingletonScope();
container
  .bind<ISettingRepository>(TYPES.ISettingRepository)
  .to(SettingRepository)
  .inSingletonScope();

export { container };
