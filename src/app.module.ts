import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamsModule } from './streams/streams.module';
import { IndexerModule } from './indexer/indexer.module';
import { StellarModule } from './stellar/stellar.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    StreamsModule,
    IndexerModule,
    StellarModule,
    MonitoringModule,
  ],
})
export class AppModule {}
