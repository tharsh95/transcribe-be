import { Module } from '@nestjs/common';
import { PythonApiController } from './python-api.controller';
import { PythonApiService } from './python-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PythonApiController],
  providers: [PythonApiService],
  exports: [PythonApiService], // Export the service so it can be used in other modules
})
export class PythonApiModule {}
