from __future__ import annotations
import subprocess
import typer

app = typer.Typer(add_completion=False)

@app.command()
def install(
  release_name: str = "production",
  namespace: str = "discord-bot-cluster",
  charts_dir: str = "../helm-charts/discord-bot-cluster",
):
  """
  Install or upgrade the Discord bot cluster Helm release.
  """
  print(f"Installing or upgrading the Discord bot cluster Helm release: {release_name} in namespace: {namespace}")
  subprocess.run(['helm', 'upgrade', '--install', release_name, charts_dir, '--namespace', namespace, '--create-namespace'])

@app.command()
def uninstall(
  release_name: str = "production",
  namespace: str = "discord-bot-cluster"
):
  """
  Uninstall the Discord bot cluster Helm release.
  """
  print("Warning: This will remove the Discord bot cluster and all associated resources.")
  subprocess.run(['helm', 'uninstall', release_name, '--namespace', namespace])

@app.command()
def build(
  no_cache: bool = True,
  image_name: str = "discord-bot:latest",
  target: str = "discord-bot",
  auto_install: bool = False
):
  """
  Build the Docker image for the Discord bot operator.
  """
  cache_option = "--no-cache" if no_cache else ""
  print(f"Building the Docker image: {image_name} with target: {target} {'without cache' if no_cache else 'with cache'}")
  subprocess.run(["docker", "build", "../", "--target", target, "--tag", image_name, cache_option])

  if auto_install:
    print(f"Installing the Docker image: {image_name} to the cluster")
    install()

if __name__ == "__main__":
  app()
