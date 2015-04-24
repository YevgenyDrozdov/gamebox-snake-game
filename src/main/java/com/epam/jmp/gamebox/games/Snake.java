package com.epam.jmp.gamebox.games;

import com.epam.jmp.gamebox.*;

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
