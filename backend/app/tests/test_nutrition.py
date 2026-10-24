import pytest
from backend.app.services import nutrition


def test_rmr():
    assert nutrition.calculate_rmr(75, 180, 20, "male") == 1780


def test_tdee():
    assert nutrition.calculate_tdee(1780, "moderately_active") == pytest.approx(2759)


def test_weight_loss_target():
    assert nutrition.calculate_calorie_target("lose", 2500, 0.5) == 1950


def test_macros_require_100_percent():
    with pytest.raises(ValueError):
        nutrition.calculate_macros(2400, 20, 20, 20)
