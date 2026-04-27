package com.himanshu_kumar.domain.model

data class LoginResult(
    val user: UserDomainModel,
    val accessToken: String,
    val refreshToken: String = "",
)
