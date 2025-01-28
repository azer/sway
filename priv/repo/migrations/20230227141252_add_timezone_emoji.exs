defmodule Sway.Repo.Migrations.AddTimezoneEmoji do
  use Ecto.Migration

  def change do
    alter table(:statuses) do
      add :timezone, :string, default: nil
      add :emoji, :string, default: nil
    end
  end
end
