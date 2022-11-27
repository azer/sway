defmodule Bafa.Repo.Migrations.AddSlugDefaultFieldsToRooms do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add :slug, :string
      add :is_default, :boolean
    end
  end
end
