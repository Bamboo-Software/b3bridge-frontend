import { useFormContext } from "react-hook-form";

import DiscordIcon from "@/assets/icons/discord-icon.svg";
import FBIcon from "@/assets/icons/facebook-icon.svg";
import GithubIcon from "@/assets/icons/github-icon.svg";
import IgIcon from "@/assets/icons/ig-icon.svg";
import RedditIcon from "@/assets/icons/reddit-icon.svg";
import TelegramIcon from "@/assets/icons/telegram-icon.svg";
import XIcon from "@/assets/icons/x-icon.svg";
import GlobeIcon from "@/assets/icons/website-icon.svg";
import ImageIcon from "@/assets/icons/image.svg";
import type { LaunchpadFormValues } from './launchpadFormValidation';

export function Step2Social() {
  const { register } = useFormContext<LaunchpadFormValues>();

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block mb-2 font-semibold text-foreground">Logo URL <span className='text-red-500'>*</span></label>
          <div className="relative">
            <input
              {...register("logoUrl", { required: true })}
              className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground"
              placeholder="Ex: https://..."
            />
            <img src={ImageIcon} alt="logo" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
          <div className="text-xs text-primary mt-1">
            URL must end with support image extention PNG, JPG or GIF
          </div>
        </div>
        <div className="flex-1">
          <label className="block mb-2 font-semibold text-foreground">Website <span className='text-red-500'>*</span></label>
          <div className="relative">
            <input
              {...register("website", { required: true })}
              className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground"
              placeholder="Ex: https://..."
            />
            <img src={GlobeIcon} alt="website" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Facebook</label>
          <div className="relative">
            <input {...register("facebook")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://facebook.com/..." />
            <img src={FBIcon} alt="facebook" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-foreground">X</label>
          <div className="relative">
            <input {...register("x")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://x.com/..." />
            <img src={XIcon} alt="x" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Github</label>
          <div className="relative">
            <input {...register("github")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://github.com/..." />
            <img src={GithubIcon} alt="github" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Telegram</label>
          <div className="relative">
            <input {...register("telegram")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://t.me/..." />
            <img src={TelegramIcon} alt="telegram" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Instagram</label>
          <div className="relative">
            <input {...register("instagram")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://instagram.com/..." />
            <img src={IgIcon} alt="instagram" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Discord</label>
          <div className="relative">
            <input {...register("discord")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://discord.com/..." />
            <img src={DiscordIcon} alt="discord" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Reddit</label>
          <div className="relative">
            <input {...register("reddit")} className="w-full pl-10 rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://reddit.com/..." />
            <img src={RedditIcon} alt="reddit" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
          </div>
        </div>
        <div className="flex-1">
          <label className="block mb-2 text-foreground">Youtube Video</label>
          <div className="relative">
            <input {...register("youtube")} className="w-full rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground" placeholder="Ex: https://you.com/watch?v=xxxx" />
          </div>
        </div>
      </div>
      <div>
        <label className="block mb-2 text-foreground">Description</label>
        <textarea
          {...register("description")}
          className="w-full rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] px-4 py-3 text-foreground"
          rows={4}
          placeholder="Ex: This is the best project"
        />
      </div>
    </div>
  );
}