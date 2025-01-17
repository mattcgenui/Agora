// -------------------------------------------------------------------------- //
// External
// -------------------------------------------------------------------------- //
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// -------------------------------------------------------------------------- //
// Internal
// -------------------------------------------------------------------------- //
import { ScoreChartComponent } from './';
import { HelperService } from '../../../../core/services';
import { distributionMock } from '../../../../testing';

// -------------------------------------------------------------------------- //
// Tests
// -------------------------------------------------------------------------- //
describe('Component: Chart - Score', () => {
  let fixture: ComponentFixture<ScoreChartComponent>;
  let component: ScoreChartComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScoreChartComponent],
      imports: [RouterTestingModule],
      providers: [HelperService],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(ScoreChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message if not data', () => {
    expect(component.score).toEqual(0);
    expect(element.querySelector('.chart-no-data')).toBeTruthy();
  });

  it('should render the chart', () => {
    const idSpy = spyOn(component, 'initData').and.callThrough();
    const icSpy = spyOn(component, 'initChart').and.callThrough();

    const distribution: any = [];

    distributionMock.overall_scores[0].bins.forEach(
      (bin: number[], i: number) => {
        distribution.push({
          key: bin[0].toFixed(2),
          value: distributionMock.overall_scores[0].distribution[i],
          range: [bin[0], bin[1]],
        });
      }
    );

    component.distribution = distribution;
    component.score = 1;
    fixture.detectChanges();

    expect(idSpy).toHaveBeenCalled();
    expect(icSpy).toHaveBeenCalled();
    expect(element.querySelector('svg')).toBeTruthy();
  });
});
