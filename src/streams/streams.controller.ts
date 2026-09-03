import { Controller, Get, Param, Query } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StreamQueryDto } from './stream.dto';

@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get('analytics/overview')
  getGlobalAnalytics() {
    return this.streamsService.getGlobalAnalytics();
  }

  @Get('stats/:address')
  getStatsForAddress(@Param('address') address: string) {
    return this.streamsService.getStatsForAddress(address);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.streamsService.findById(id);
  }

  @Get(':id/events')
  getEvents(@Param('id') id: string) {
    return this.streamsService.getEvents(id);
  }

  @Get('sender/:address')
  findBySender(@Param('address') address: string, @Query() query: StreamQueryDto) {
    return this.streamsService.findBySender(address, query);
  }

  @Get('recipient/:address')
  findByRecipient(@Param('address') address: string, @Query() query: StreamQueryDto) {
    return this.streamsService.findByRecipient(address, query);
  }
}
