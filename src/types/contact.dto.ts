import { ChannelKey } from './channelKey';

export interface ICreateContactInputDto {
  name: string;
  number: string;
  channel?: ChannelKey;
}
