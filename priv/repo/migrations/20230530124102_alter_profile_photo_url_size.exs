defmodule Sway.Repo.Migrations.AlterProfilePhotoUrlSize do
  use Ecto.Migration

  def up do
    alter table(:users) do
      modify :profile_photo_url, :text
    end
  end

  def down do
    alter table(:users) do
      modify :profile_photo_url, :string
    end
  end
end
