defmodule Sway.Mailer do
  use Swoosh.Mailer, otp_app: :sway

  def from do
    {"Sway", "azer@sway.so"}
  end
end
