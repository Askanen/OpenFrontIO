import { Execution, Game, Player, Unit, UnitType } from "../game/Game";
import { TileRef } from "../game/GameMap";
import { TrainStationExecution } from "./TrainStationExecution";

export class MetropoleExecution implements Execution {
  private mg: Game;
  private metropole: Unit | null = null;
  private active: boolean = true;

  constructor(
    private player: Player,
    private tile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (this.metropole === null) {
      const spawnTile = this.player.canBuild(UnitType.Metropole, this.tile);
      if (spawnTile === false) {
        console.warn("cannot build metropole");
        this.active = false;
        return;
      }
      this.metropole = this.player.buildUnit(UnitType.Metropole, spawnTile, {});
      this.createStation();
    }
    if (!this.metropole.isActive()) {
      this.active = false;
      return;
    }

    if (this.player !== this.metropole.owner()) {
      this.player = this.metropole.owner();
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  private createStation(): void {
    if (this.metropole !== null) {
      const nearbyFactory = this.mg.hasUnitNearby(
        this.metropole.tile()!,
        this.mg.config().trainStationMaxRange(),
        UnitType.Factory,
      );
      if (nearbyFactory) {
        this.mg.addExecution(new TrainStationExecution(this.metropole));
      }
    }
  }
}
