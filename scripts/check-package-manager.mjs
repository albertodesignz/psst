if (!process.env.npm_config_user_agent?.startsWith("pnpm/")) {
  console.error(
    "Use pnpm to install this workspace. On Windows, run .\\Start-PSST.ps1.",
  );
  process.exit(1);
}
