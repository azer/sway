defmodule Sway.Repo.Migrations.AddDailyRoomUrlToWorkspaces do
  use Ecto.Migration

  def change do
    alter table(:workspaces) do
      add :daily_room_url, :string
    end

    create unique_index(:workspaces, [:daily_room_url])
  end
end
