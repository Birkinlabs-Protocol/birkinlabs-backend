import { Controller, Get, Param } from '@nestjs/common';
import { StreamsService } from './streams.service';

@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.streamsService.findById(id);
  }

  @Get('sender/:address')
  findBySender(@Param('address') address: string) {
    return this.streamsService.findBySender(address);
  }

  @Get('recipient/:address')
  findByRecipient(@Param('address') address: string) {
    return this.streamsService.findByRecipient(address);
  }
}
