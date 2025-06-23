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
import { FundAdapter, type IFundAdapter } from '../adapters/fund.adapter';
import {
  OfferingBatchAdapter,
  type IOfferingBatchAdapter,
} from '../adapters/offeringBatch.adapter';
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
import { FundRepository, type IFundRepository } from '../repositories/fund.repository';
import {
  OfferingBatchRepository,
  type IOfferingBatchRepository,
} from '../repositories/offeringBatch.repository';
import { SupabaseAuditService, type AuditService } from '../services/AuditService';
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
  .bind<IFundAdapter>(TYPES.IFundAdapter)
  .to(FundAdapter)
  .inSingletonScope();
container
  .bind<IOfferingBatchAdapter>(TYPES.IOfferingBatchAdapter)
  .to(OfferingBatchAdapter)
  .inSingletonScope();

// Register services
container
  .bind<AuditService>(TYPES.AuditService)
  .to(SupabaseAuditService)
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
  .bind<IFinancialTransactionRepository>(TYPES.IFinancialTransactionRepository)
  .to(FinancialTransactionRepository)
  .inSingletonScope();
container
  .bind<IOfferingBatchRepository>(TYPES.IOfferingBatchRepository)
  .to(OfferingBatchRepository)
  .inSingletonScope();

export { container };
