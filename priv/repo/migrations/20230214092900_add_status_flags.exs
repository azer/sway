defmodule Sway.Repo.Migrations.AddStatusFlags do
  use Ecto.Migration

  def change do
    alter table(:statuses) do
      remove :is_active
      add :camera_on, :boolean, default: false
      add :mic_on, :boolean, default: false
      add :speaker_on, :boolean, default: false
    end
  end
end
