package com.epam.jmp.gamebox.games;

import com.epam.jmp.gamebox.*;
import com.epam.jmp.gamebox.annotations.Controller;

@Controller(gameName = "Snake1", gameVersion = "10.0")
public class Snake implements GameController {

    @Override
    public void init(GameContext gameContext) {

    }

    @Override
    public void processAction(Action action, GameModel model) {
        System.out.println(action.getActionId());
    }

    @Override
    public View processRender(GameModel model) {
        return null;
    }

}
